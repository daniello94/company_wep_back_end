const { Storage } = require('@google-cloud/storage');
const path = require('path');
require("dotenv").config();
const Gallery = require('../models/Gallery');

const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n')
    }
});

exports.createGallery = async (req, res) => {
    const { nameGallery } = req.body;

    try {
        const newGallery = new Gallery({
            gallery: {
                nameGallery: nameGallery,
                photos: []
            }
        });
        await newGallery.save();
        res.status(201).json({ message: 'Galeria utworzona pomyślnie', newGallery });
    } catch (error) {
        res.status(500).json({ message: 'Wystąpił błąd podczas tworzenia galerii', error: error.message });
    }
};

exports.addPhotos = async (req, res, next) => {
    const { galleryId } = req.params;
    const bucket = storage.bucket(process.env.MY_DATA);
    try {
        const gallery = await Gallery.findById(galleryId);
        if (!gallery) {
            return res.status(404).json({ message: 'Galeria nie znaleziona' });
        }
        const uploadedImages = await Promise.all(req.files.map(async (file) => {
            const gcsFileName = `uploads/${Date.now()}-${file.originalname}`;
            const blob = bucket.file(gcsFileName);


            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: file.mimetype,
                },
            });

            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`;

            return new Promise((resolve, reject) => {
                blobStream.on('error', (error) => reject(error));
                blobStream.on('finish', () => {

                    resolve({
                        namePhoto: file.originalname,
                        photoUrl: publicUrl,
                        smallGallery: false,
                    });
                });
                blobStream.end(file.buffer);
            });
        }));

        uploadedImages.forEach(image => gallery.gallery.photos.push(image));

        await gallery.save();
        res.status(201).json({ message: 'Zdjęcia dodane pomyślnie', gallery });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Wystąpił błąd podczas dodawania zdjęć', error: error.message });
    }
};

exports.getAllGalleries = async (req, res) => {
    try {
        const galleries = await Gallery.find();
        res.status(200).json(galleries);
    } catch (error) {
        res.status(500).json({ message: 'Wystąpił błąd serwera', error: error.message });
    }
};

exports.getGalleryById = async (req, res) => {
    try {
        const galleryId = req.params.id;
        const gallery = await Gallery.findById(galleryId);

        if (!gallery) {
            return res.status(404).json({ message: 'Galeria nie znaleziona' });
        }

        res.status(200).json(gallery);
    } catch (error) {
        res.status(500).json({ message: 'Wystąpił błąd serwera', error: error.message });
    }
};

exports.toggleSmallGallery = async (req, res) => {
    const { galleryId, photoId } = req.params;

    try {
        const gallery = await Gallery.findById(galleryId);
        if (!gallery) {
            return res.status(404).json({ message: 'Galeria nie znaleziona' });
        }

        const photo = gallery.gallery.photos.find(photo => photo._id.toString() === photoId);
        if (photo) {
            photo.smallGallery = !photo.smallGallery;
        } else {
            return res.status(404).json({ message: 'Zdjęcie nie znalezione' });
        }

        await gallery.save();
        res.status(200).json({ message: 'Flaga smallGallery zmieniona pomyślnie', gallery });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Wystąpił błąd podczas zmiany flagi', error: error.message });
    }
};

exports.deletePhoto = async (req, res) => {
    const { galleryId, photoId } = req.params;

    try {
        const gallery = await Gallery.findById(galleryId);
        if (!gallery) {
            return res.status(404).json({ message: 'Galeria nie znaleziona' });
        }

        // Znajdowanie zdjęcia do usunięcia
        const photoIndex = gallery.gallery.photos.findIndex(photo => photo._id.toString() === photoId);
        if (photoIndex === -1) {
            return res.status(404).json({ message: 'Zdjęcie nie znalezione' });
        }

        const photo = gallery.gallery.photos[photoIndex];

        // Usunięcie zdjęcia z Google Cloud Storage
        const blob = bucket.file(photo.namePhoto); // Zakładając, że photo.namePhoto zawiera nazwę pliku w chmurze
        await blob.delete();

        // Usunięcie zdjęcia z tablicy photos w galerii
        gallery.gallery.photos.splice(photoIndex, 1);

        await gallery.save();
        res.status(200).json({ message: 'Zdjęcie usunięte pomyślnie', gallery });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Wystąpił błąd podczas usuwania zdjęcia', error: error.message });
    }
};



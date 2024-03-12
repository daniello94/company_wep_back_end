const { Storage } = require('@google-cloud/storage');
const path = require('path');
require("dotenv").config();
const express = require('express');
const sharp = require('sharp');
const Gallery = require('../models/Gallery');

const storage = new Storage({
    keyFilename: path.join(__dirname, 'config', 'secret-key.json'),
});


exports.createGallery = async (req, res) => {
    const { nameGallery } = req.body;

    try {
        const newGallery = new Gallery({
            gallery: {
                nameGallery: nameGallery,
                photos: [] // początkowo galeria nie zawiera zdjęć
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



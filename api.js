const express = require('express');
const router = express.Router();
const multer = require('multer');
const galleryController = require('./controller/gallery.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/createGallery', galleryController.createGallery);

router.post('/addPhotos/:galleryId', upload.array('photos'), galleryController.addPhotos);

router.get('/galleries', galleryController.getAllGalleries);

router.get('/gallery/:id', galleryController.getGalleryById);

router.delete('/galleries/:galleryId/photos/:photoId', galleryController.deletePhoto);

router.patch('/galleries/:galleryId/photos/:photoId/toggleSmall', galleryController.toggleSmallGallery);

module.exports = router;

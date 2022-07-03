const mongoose = require('mongoose');

const File = new mongoose.Schema({
    path: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    downloadCount: {
        type: Number,
        default: 0,
        required: true
    }
})

module.exports = mongoose.model('File', File);
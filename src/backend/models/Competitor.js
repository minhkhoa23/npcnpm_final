const mongoose = require('mongoose');

const competitorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Competitor name is required'],
        trim: true
    },
    logoUrl: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    mail: {
        type: String,
        trim: true,
        lowercase: true
    },
    games: [{
        type: String,
        trim: true
    }],
    region: {
        type: String,
        trim: true
    },
    members: [{
        name: {
            type: String,
            trim: true
        },
        role: {
            type: String,
            trim: true
        },
        avatar: {
            type: String,
            trim: true
        }
    }],
    achievements: [{
        title: {
            type: String,
            trim: true
        },
        year: {
            type: Number
        },
        tournament: {
            type: String,
            trim: true
        }
    }],
    socialLinks: {
        facebook: {
            type: String,
            trim: true
        },
        twitter: {
            type: String,
            trim: true
        },
        youtube: {
            type: String,
            trim: true
        },
        twitch: {
            type: String,
            trim: true
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
competitorSchema.index({ games: 1 });
competitorSchema.index({ region: 1 });
competitorSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Competitor', competitorSchema);

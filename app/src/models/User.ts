import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (value: string) => {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: "Invalid email address"
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 100,
    },
    role: {
        type: String,
        enum: ['admin', 'staff', 'customer'],
        required: true,
    },
},{ timestamps: true }
);

// Reuse the existing model if it was already registered (prevents overwrite errors in hot reload).
export const User = mongoose.models.User || mongoose.model("User", userSchema);
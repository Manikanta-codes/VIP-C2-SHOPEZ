const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['USER', 'ADMIN'],
        message: 'Role must be either USER or ADMIN',
      },
      default: 'USER',
    },
    virtualBalance: {
      type: Number,
      default: 100000,
      min: [0, 'Balance cannot be negative'],
    },
    avatar: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Pre-save hook: hash password only if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Generate avatar from name if not set
    if (!this.avatar) {
      this.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        this.name
      )}&background=random&color=fff&size=128`;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Also generate avatar on name set if avatar is empty
userSchema.pre('save', function (next) {
  if (!this.avatar && this.name) {
    this.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      this.name
    )}&background=random&color=fff&size=128`;
  }
  next();
});

// Method: compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method: remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

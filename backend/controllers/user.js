import User from "../models/user.js";
import bcrypt from "bcrypt";

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    delete user.password;

    // jfkd

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);

    res.status(500).json({ message: "Server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, profilePicture, logo } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate profilePicture if provided
    if (profilePicture && profilePicture.length > 0) {
      // Check if it's a valid base64 image
      if (!profilePicture.startsWith('data:image/')) {
        return res.status(400).json({ message: "Invalid image format" });
      }
      
      // Check base64 string length (max 5MB limit for base64)
      const maxBase64Length = 7000000; // ~5MB in base64
      
      if (profilePicture.length > maxBase64Length) {
        return res.status(400).json({ message: "Image size too large. Please use an image smaller than 5MB." });
      }
    }

    // Validate logo if provided
    if (logo && logo.length > 0) {
      // Check if it's a valid base64 image
      if (!logo.startsWith('data:image/')) {
        return res.status(400).json({ message: "Invalid logo format" });
      }
      
      // Check base64 string length (max 5MB limit for base64)
      const maxBase64Length = 7000000; // ~5MB in base64
      
      if (logo.length > maxBase64Length) {
        return res.status(400).json({ message: "Logo size too large. Please use an image smaller than 5MB." });
      }
    }

    user.name = name;
    user.profilePicture = profilePicture;
    user.logo = logo;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user profile:", error);

    res.status(500).json({ message: "Server error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "New password and confirm password do not match" });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(403).json({ message: "Invalid old password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);

    res.status(500).json({ message: "Server error" });
  }
};

export { getUserProfile, updateUserProfile, changePassword };
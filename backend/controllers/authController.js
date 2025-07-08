const authService = require("../services/authService");

class AuthController {
  /**
   * Register a new user
   */
  async register(req, res) {
    try {
      const { userData, userType } = req.body;

      // Validate required fields based on user type
      const requiredFields = {
        parent: [
          "first_name",
          "last_name",
          "username",
          "password",
          "email",
          "phone_number",
        ],
        medicalStaff: [
          "first_name",
          "last_name",
          "username",
          "password",
          "email",
          "phone_number",
          "staff_role", // Changed from 'role' to 'staff_role'
        ],
        student: ["first_name", "last_name", "class_name"],
      };

      const missingFields = requiredFields[userType]?.filter(
        (field) => !userData[field]
      );

      if (missingFields?.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(", ")}`,
        });
      }

      const user = await authService.register(userData, userType);

      res.status(201).json({ success: true, data: user });
    } catch (error) {
      console.error("Registration error:", error);

      if (error.code === 11000) {
        // MongoDB duplicate key error
        return res.status(400).json({
          success: false,
          message: "Username or email already exists",
        });
      }

      res
        .status(500)
        .json({ success: false, message: error.message || "Server error" });
    }
  }

  /**
   * Login a user
   */
  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Please provide username and password",
        });
      }

      const result = await authService.login(username, password);

      res.status(200).json({
        success: true,
        data: {
          token: result.token,
          user: result.user,
        },
      });
    } catch (error) {
      console.error("Login error:", error);

      // Handle authentication errors
      if (
        error.message === "User not found" ||
        error.message === "Invalid credentials"
      ) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }

      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req, res) {
    try {
      // User is already available in req due to authenticate middleware
      res.status(200).json({ success: true, data: req.user });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * Change password
   */
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Please provide current and new password",
        });
      }

      await authService.changePassword(
        req.user._id,
        req.userType,
        currentPassword,
        newPassword
      );

      res
        .status(200)
        .json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Change password error:", error);

      if (error.message === "Current password is incorrect") {
        return res.status(400).json({ success: false, message: error.message });
      }

      res.status(500).json({ success: false, message: "Server error" });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated via this endpoint
      const forbiddenFields = [
        "password",
        "username",
        "role",
        "staff_role",
        "student_id",
        "is_active",
      ];
      forbiddenFields.forEach((field) => delete updateData[field]);

      const updatedUser = await authService.updateProfile(
        req.user._id,
        req.userType,
        updateData
      );

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("Update profile error:", error);

      if (error.message === "User not found") {
        return res.status(404).json({ success: false, message: error.message });
      }

      if (error.message === "No valid fields provided for update") {
        return res.status(400).json({ success: false, message: error.message });
      }

      // Handle validation errors
      if (error.name === "ValidationError") {
        const validationErrors = Object.values(error.errors).map(
          (err) => err.message
        );
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: validationErrors,
        });
      }

      res.status(500).json({ success: false, message: "Server error" });
    }
  }
}

module.exports = new AuthController();

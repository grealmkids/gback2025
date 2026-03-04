// Basic Admin authorization since frontend uses Firebase directly
const authenticateAdmin = (req, res, next) => {
    const email = req.headers['x-admin-email'];

    if (!email) {
        return res.status(401).json({ message: "Authentication required" });
    }

    // The user's email MUST explicitly match the admin emails
    if (email === "grealmkids@gmail.com" || email === "ochalfie@gmail.com") {
        req.user = { email, role: 'admin' };
        next();
    } else {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }
};

module.exports = authenticateAdmin;

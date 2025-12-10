import jwt from "jsonwebtoken"

async function tokenAuth(req, res, next) {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: true,
                success: false,
                message: "No authorization header provided"
            });
        }

        // Extract token from "Bearer <token>" format
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;

        if (!token) {
            return res.status(401).json({
                error: true,
                success: false,
                message: "No token provided"
            });
        }

        // Verify and decode the token
        const decoded = jwt.verify(token, "MySecretCode");

        // Add user information to request object (both formats for compatibility)
        req.userData = {
            userId: decoded.userId,
            email: decoded.email
        };

        req.user = {
            _id: decoded.userId,
            email: decoded.email
        };

        // Continue to next middleware or route handler
        next();

    } catch (err) {
        // Handle specific JWT errors
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: true,
                success: false,
                message: "Token has expired"
            });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: true,
                success: false,
                message: "Invalid token"
            });
        } else if (err.name === 'NotBeforeError') {
            return res.status(401).json({
                error: true,
                success: false,
                message: "Token not active yet"
            });
        } else {
            return res.status(500).json({
                error: true,
                success: false,
                message: "Token verification failed"
            });
        }
    }
}

export default tokenAuth
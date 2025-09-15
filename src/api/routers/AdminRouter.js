import express from 'express';

import authenticateIdentity from '../../middlewares/AuthMiddleware.js';
import authorizeRoles from '../../middlewares/AuthorizationMiddleware.js';
import {
    getUsers,
    patchUserStatus,
    patchUserRole
} from '../controllers/AdminController.js';

const AdminRouter = express.Router()

AdminRouter
    .get("/users", authenticateIdentity, authorizeRoles('super', 'admin'), getUsers)
    .patch("/users/status", authenticateIdentity, authorizeRoles('super', 'admin'), patchUserStatus)
    .patch("/users/role", authenticateIdentity, authorizeRoles('super'), patchUserRole)
;

export default AdminRouter;
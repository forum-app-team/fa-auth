import { getUserList, updateUser } from '../../services/AdminService.js'

export const getUsers = async (req, res, next) => {
    try {
        const limit = Number(req.query.limit), offset = Number(req.query.offset);
        if (!Number.isInteger(limit) || !Number.isInteger(offset))
            return res.status(400).json({message: "Requires limit and offset to be integers"});
        const ret = await getUserList(limit, offset);
        return res.status(200).json(ret);
    } catch(error) {
        next(error);
    }
};

export const patchUserStatus = async (req, res, next) => {
    try {
        const [{id, active}] = req.body;
        if (!id || active === undefined)
            return res.status(400).json({message: "Requires user ID and status"});
        await updateUser({id, active});
        return res.status(200).json({message: "Successfully updated user status"});
    } catch(error) {
        next(error);
    }
};

export const patchUserRole = async (req, res, next) => {
    try {
        const [{id, role}] = req.body;
        if (!id || !role)
            return res.status(400).json({message: "Requires user ID and role"});
        await updateUser({id, role});
        return res.status(200).json({message: "Successfully updated user role"});
    } catch(error) {
        next(error);
    }
};
import { Op } from 'sequelize';
import Identity from '../models/Identity.js';
import AuthError from '../utils/error.js';

export const getUserList = async (limit, offset) => {
    limit = Math.min(50, limit);
    offset = Math.max(0, offset);

    const totalCount = (await Identity.count()) - 1;
    const users = await Identity.findAll({
        where: { [Op.not]: { role: 'super'} },
        limit,
        offset,
        order: [['createdAt', 'DESC'], ['id', 'DESC']], // stable ordering
        attributes: ['id','email','createdAt','role','isActive'],
    });

    return {users: users.map(e => e.toJSON()), totalCount};
};

export const updateUser = async ({id, role, active}) => {
    const identity = await Identity.findByPk(id);
    if (!identity)
        throw new AuthError("User not found", 404);

    if (role)
        identity.role = role;
    if (active !== undefined)
        identity.isActive = active;

    await identity.save();
};
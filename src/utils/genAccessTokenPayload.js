const genPayload = (identity) => {
    const payload = {
        sub: identity.id,
        role: identity.role,
        emailVerified: identity.emailVerified
    };
    return payload;
}

export default genPayload;
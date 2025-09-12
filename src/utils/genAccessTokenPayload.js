const genPayload = (identity) => {
    const payload = {
        sub: identity.id,
        email: identity.email,
        role: identity.role,
        emailVerified: identity.emailVerified
    };
    return payload;
}

export default genPayload;
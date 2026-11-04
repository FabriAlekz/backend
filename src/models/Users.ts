export class ProfileResponse {
    role: string | null;
    type_perfil: string | null;
    username: string;
    name: string;
    lastname: string;
    email: string | null;
    phone: string | null;
    picture_profile: string | null;
    created_initial: Date;
    created_end: Date | null;

    constructor(
        role: string | null,
        type_perfil: string | null,
        username: string,
        name: string,
        lastname: string,
        email: string | null,
        phone: string | null,
        picture_profile: string | null,
        created_initial: Date,
        created_end: Date | null
    ) {
        this.role = role;
        this.type_perfil = type_perfil;
        this.username = username;
        this.name = name;
        this.lastname = lastname;
        this.email = email;
        this.phone = phone;
        this.picture_profile = picture_profile;
        this.created_initial = created_initial;
        this.created_end = created_end;
    }
}

export class LoginRequest {
    username: string;
    password: string;

    constructor(username: string, password: string) {
        this.username = username;
        this.password = password;
    }
}

export class LoginResponse {
    role: string | null;
    type_perfil: string | null;
    username: string;
    name: string;
    lastname: string;
    email: string | null;
    phone: string | null;
    picture_profile: string | null;
    created_initial: Date;
    created_end: Date | null;

    constructor(
        role: string | null,
        type_perfil: string | null,
        username: string,
        name: string,
        lastname: string,
        email: string | null,
        phone: string | null,
        picture_profile: string | null,
        created_initial: Date,
        created_end: Date | null,
    ) {
        this.role = role;
        this.type_perfil = type_perfil;
        this.username = username;
        this.name = name;
        this.lastname = lastname;
        this.email = email;
        this.phone = phone;
        this.picture_profile = picture_profile;
        this.created_initial = created_initial;
        this.created_end = created_end;
    }
}

export class RegisterUserRequest {
    id_profile?: number | null;
    id_rol: number;
    username: string;
    name: string;
    lastname: string;
    password: string;
    picture_profile?: string;
    email?: string | null;
    phone?: string | null;

    constructor(
        id_profile: number | null,
        id_rol: number,
        username: string,
        name: string,
        lastname: string,
        password: string,
        picture_profile?: string,
        email?: string | null,
        phone?: string | null,
    ) {
        this.id_profile = id_profile;
        this.id_rol = id_rol;
        this.username = username;
        this.name = name;
        this.lastname = lastname;
        this.password = password;
        this.picture_profile = picture_profile;
        this.email = email;
        this.phone = phone;
    }
}

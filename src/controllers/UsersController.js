const AppError = require("../utils/AppError")
const sqliteConnection = require("../database/sqlite")

// funções para encriptar a senha
const { hash, compare } = require("bcryptjs")

class UsersController {
    async create(request, response) {
        const { name, email, password } = request.body

        const database = await sqliteConnection()

        const checkUserExists = await database.get("SELECT * FROM users WHERE email = (?)", [email])


        if(!name) {
            throw new AppError("Nome de usuário obrigatório.")
        }

        if(checkUserExists) {
            throw new AppError("Este email já está sendo utilizado.")
        }

        // criptografia
        const hashedPassword = await hash(password, 8)

        // inserindo novo user
        await database.run(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        )

        return response.status(201).json()
    }

    async update(request, response) {
        const {name, email, password, oldPassword} = request.body
        const user_id = request.user.id

        const database = await sqliteConnection()
        const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id])

        if(!user) {
            throw new AppError("Usuário não encontrado")
        }

        const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])

        if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
            throw new AppError("Este email já está em uso.")
        }

        user.name = name ?? user.name
        user.email = email ?? user.name

        if(password && !oldPassword) {
            throw new AppError("Insira a senha antiga")
        }

        if(password && oldPassword) {

            // comparando a senha atual e a antiga
            const checkOldPassword = await compare(oldPassword, user.password)

            if(!checkOldPassword) {
                throw new AppError("A senha está incorreta.")
            }

            user.password = await hash(password, 8)
        }

        await database.run(`
            UPDATE users SET 
            name = ?,
            email = ?,
            password = ?,
            updated_at = DATETIME("now")
            WHERE id = ?`,
            [user.name,
            user.email,
            user.password,
            user_id]
        )

        return response.status(200).json()
    }
}

module.exports = UsersController
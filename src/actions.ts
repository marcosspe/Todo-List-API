import { Request, Response } from 'express'
import { getRepository } from 'typeorm'  
import { Users } from './entities/Users'
import { Exception } from './utils'
import { Todos } from './entities/Todos'

export const createUser = async (req: Request, res:Response): Promise<Response> =>{

	// important validations to avoid ambiguos errors, the client needs to understand what went wrong
	if(!req.body.first_name) throw new Exception("Please provide a first_name")
	if(!req.body.last_name) throw new Exception("Please provide a last_name")
	if(!req.body.email) throw new Exception("Please provide an email")
	if(!req.body.password) throw new Exception("Please provide a password")

	const userRepo = getRepository(Users)
	// fetch for any user with this email
	const user = await userRepo.findOne({ where: {email: req.body.email }})
	if(user) throw new Exception("Users already exists with this email")

	const newUser = getRepository(Users).create(req.body);  //Creo un usuario
	const results = await getRepository(Users).save(newUser); //Grabo el nuevo usuario 
	return res.json(results);
}

export const getUsers = async (req: Request, res: Response): Promise<Response> =>{
		const users = await getRepository(Users).find();
		return res.json(users);
}

export const getUser = async (req: Request, res: Response): Promise<Response> =>{
        const users = await getRepository(Users).findOne(req.params.id);
        return res.json(users);
}

export const deleteUsers = async (req: Request, res: Response): Promise<Response> =>{
        const users = await getRepository(Users).findOne(req.params.id);
        if(!users){
            return res.json({"message": "Usuario no existe"})
        }
        else{
            const result = await getRepository(Todos).delete({users: users});
            await getRepository(Users).delete(users);
            return res.json(result);

            //const result = await getRepository(Users).delete(req.params.id);
            //return res.json(result);
        }
}

export const getTodos = async (req: Request, res: Response): Promise<Response> =>{
 
         const users = await getRepository(Users).findOne(req.params.id);
        if(!users){
            return res.json({"message": "Usuario no existe"})
        }else{
            const result = await getRepository(Todos).find({where: {users: users}});
            return res.json(result);
        }
}

export const createTodos = async (req: Request, res:Response): Promise<Response> =>{
    
    if(!req.body.label) throw new Exception("write a label please")    
    const userTodos = getRepository(Users)
	const userTodo = await userTodos.findOne(req.params.id)
	if(userTodo) {
        let todos = new Todos();
        todos.label = req.body.label;
        todos.done = false;
        todos.users = userTodo;
        const results = await getRepository(Todos).save(todos);
        return res.json(results);
    }else{
        return res.json("error");
    }
}

export const updateTodos = async (req: Request, res: Response): Promise<Response> =>{
        const todos = await getRepository(Todos).findOne(req.params.id);
        if(todos){
            getRepository(Todos).merge(todos, req.body); 
            const results = await getRepository(Todos).save(todos)
            return res.json(results);
        }
        return res.json({msg: "Usuario no existe"})
}
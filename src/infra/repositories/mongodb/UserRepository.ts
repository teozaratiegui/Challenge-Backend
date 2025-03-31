import { IUserRepository } from "../../../app/repositories/IUserRepository";
import { ICreateUserRequestDTO } from "../../../domain/dtos/User/ICreateUserRequestDTO";
import { IFindByEmail } from "../../../domain/dtos/User/IFindByEmail";
import { IUserOutRequestDTO } from "../../../domain/dtos/User/IUserOutRequestDTO";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });

const UserModel = mongoose.model("User", UserSchema);

export class MongooseUserRepository implements IUserRepository {

  async create(userDTO: ICreateUserRequestDTO): Promise<IUserOutRequestDTO> {
    const user = new UserModel({
      name: userDTO.name,
      email: userDTO.email,
      password: userDTO.password,
    });

    const newUser = await user.save();
    return {
      id: newUser._id.toString(), // Convertir ObjectId a string
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
    };
  }

  async findAll(): Promise<IUserOutRequestDTO[]> {
    const userDocs = await UserModel.find().exec();
    return userDocs.map(userDoc => ({
      id: userDoc._id.toString(), // Convertir ObjectId en string
      name: userDoc.name,
      email: userDoc.email,
      createdAt: userDoc.createdAt, // Se obtiene de Mongoose timestamps
    }));
  }

  async findByEmail(email: string): Promise<IFindByEmail | null> {
    const user = await UserModel.findOne({ email });
    if (!user) return null;
    return {id: user.id.toString(), name: user.name, email: user.email, password: user.password};
  }
}

export default MongooseUserRepository;
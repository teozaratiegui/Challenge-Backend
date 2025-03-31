import { ICreateUserRequestDTO } from 'domain/dtos/User/ICreateUserRequestDTO';
import { IFindByEmail } from 'domain/dtos/User/IFindByEmail';
import { IUserOutRequestDTO } from 'domain/dtos/User/IUserOutRequestDTO';


export interface IUserRepository {
    create(data: ICreateUserRequestDTO): Promise<IUserOutRequestDTO>

    findAll(): Promise<IUserOutRequestDTO[]>

    findByEmail(email: string): Promise<null | IFindByEmail>
}
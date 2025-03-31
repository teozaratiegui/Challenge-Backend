import { ICreateUserRequestDTO } from '../dtos/User/ICreateUserRequestDTO'
import { IUserOutRequestDTO } from '../dtos/User/IUserOutRequestDTO'

/**
 * Interface representing the structure of a user.
 *
 * @interface
 */
export interface UserInterface {
  name: string
  email: string
  password: string
}

/**
 * Class representing a user.
 *
 * @class
 */
export class UserEntity {
  private _name: string
  private _email: string
  private _password: string

  /**
   * Creates a new user instance based on the provided data.
   *
   * @static
   * @param {ICreateUserRequestDTO} data - The data to create a user.
   * @returns {UserEntity} The created user instance.
   */
  static create({ email, name, password }: ICreateUserRequestDTO): UserEntity {
    return new UserEntity({ name, email: email, password })
  }

  /**
   * Gets the user's name.
   *
   * @readonly
   */
  get name(): string {
    return this._name
  }

  /**
   * Gets the user's email.
   *
   * @readonly
   */
  get email(): string {
    return this._email
  }

  /**
   * Gets the user's password.
   *
   * @readonly
   */
  get password(): string {
    return this._password
  }

  /**
   * Creates an instance of UserEntity.
   *
   * @constructor
   * @param {UserInterface} props - The properties of the user.
   */
  constructor(props: UserInterface) {
    this._name = props.name
    this._password = props.password
    this._email = props.email
  }
}
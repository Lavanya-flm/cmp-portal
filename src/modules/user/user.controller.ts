import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { sendSuccess, sendPaginated } from '../../core/utils/response.util';
import { assertAuthenticated } from '../../core/middleware/auth.middleware';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateMyProfileDto,
  ChangeRoleDto,
  ChangePasswordDto,
  UserQueryDto,
} from './user.types';

export class UserController {
  // ─── Admin endpoints ────────────────────────────────────────────────────────

  /** POST /users */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreateUserDto;
      const user = await userService.createUser(dto);
      sendSuccess(res, user, 'User created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  /** GET /users */
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as UserQueryDto;
      const { users, meta } = await userService.getUsers(query);
      sendPaginated(res, users, meta, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /** GET /users/:id */
  async findOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /** PUT /users/:id */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = req.body as UpdateUserDto;
      const user = await userService.updateUser(id, dto);
      sendSuccess(res, user, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /** DELETE /users/:id */
  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      assertAuthenticated(req);
      const { id } = req.params;
      await userService.deleteUser(id, req.user.id);
      sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /users/:id/role */
  async changeRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const dto = req.body as ChangeRoleDto;
      const user = await userService.changeRole(id, dto);
      sendSuccess(res, user, 'User role updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ─── Self-service endpoints ─────────────────────────────────────────────────

  /** GET /users/me */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      assertAuthenticated(req);
      const user = await userService.getMyProfile(req.user.id);
      sendSuccess(res, user, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /users/me */
  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      assertAuthenticated(req);
      const dto = req.body as UpdateMyProfileDto;
      const user = await userService.updateMyProfile(req.user.id, dto);
      sendSuccess(res, user, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /users/me/password */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      assertAuthenticated(req);
      const dto = req.body as ChangePasswordDto;
      await userService.changePassword(req.user.id, dto);
      sendSuccess(res, null, 'Password changed successfully. Please log in again.');
    } catch (error) {
      next(error);
    }
  }
}

const controller = new UserController();
export const userController = {
  create:         controller.create.bind(controller),
  findAll:        controller.findAll.bind(controller),
  findOne:        controller.findOne.bind(controller),
  update:         controller.update.bind(controller),
  remove:         controller.remove.bind(controller),
  changeRole:     controller.changeRole.bind(controller),
  getMe:          controller.getMe.bind(controller),
  updateMe:       controller.updateMe.bind(controller),
  changePassword: controller.changePassword.bind(controller),
};

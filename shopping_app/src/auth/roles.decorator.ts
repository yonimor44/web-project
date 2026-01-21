import { SetMetadata } from '@nestjs/common';

// הפונקציה הזו מאפשרת לנו לכתוב @Roles('admin') מעל לקונטרולר
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
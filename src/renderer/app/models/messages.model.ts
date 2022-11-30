import { ServerErrorCodes } from '@mockoon/commons';

export type MessageLevels = 'error' | 'info';
export type MessageParams = {
  [key: string]: any;
  error?: Error & { code?: string };
};
export type MessageCodes =
  | keyof typeof ServerErrorCodes
  | 'INITIALIZING_APP'
  | 'UNKNOWN_ERROR'
  | 'ENVIRONMENT_STOPPED'
  | 'ENVIRONMENT_STARTED'
  | 'CREATING_PROXY'
  | 'OPENAPI_EXPORT'
  | 'OPENAPI_EXPORT_SUCCESS'
  | 'OPENAPI_EXPORT_ERROR'
  | 'OPENAPI_IMPORT'
  | 'OPENAPI_IMPORT_SUCCESS'
  | 'OPENAPI_IMPORT_ERROR'
  | 'COPY_ENVIRONMENT_CLIPBOARD'
  | 'COPY_ENVIRONMENT_CLIPBOARD_SUCCESS'
  | 'COPY_ENVIRONMENT_CLIPBOARD_ERROR'
  | 'COPY_ROUTE_CLIPBOARD'
  | 'COPY_ROUTE_CLIPBOARD_SUCCESS'
  | 'COPY_ROUTE_CLIPBOARD_ERROR'
  | 'NEW_ENVIRONMENT_FROM_URL'
  | 'NEW_ENVIRONMENT_CLIPBOARD_ERROR'
  | 'NEW_ENVIRONMENT_URL_ERROR'
  | 'NEW_ROUTE_CLIPBOARD_ERROR'
  | 'ENVIRONMENT_FILE_IN_USE'
  | 'FIRST_LOAD_DEMO_ENVIRONMENT'
  | 'ENVIRONMENT_MORE_RECENT_VERSION'
  | 'ENVIRONMENT_IS_EXPORT_FILE'
  | 'ENVIRONMENT_MIGRATION_FAILED'
  | 'ENVIRONMENT_RELOADED'
  | 'STORAGE_LOAD_ERROR'
  | 'STORAGE_SAVE_ERROR'
  | 'MIGRATING_ENVIRONMENT'
  | 'DEBUG';

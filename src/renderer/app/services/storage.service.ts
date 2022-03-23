import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, from, Observable, of } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  mergeMap,
  tap
} from 'rxjs/operators';
import { Logger } from 'src/renderer/app/classes/logger';
import { MainAPI } from 'src/renderer/app/constants/common.constants';
import { ToastsService } from 'src/renderer/app/services/toasts.service';
import * as loadash from 'lodash';
import { LocalStorageService } from 'src/renderer/app/services/local-storage.service';

@Injectable({ providedIn: 'root' })
export class StorageService extends Logger {
  private saving$ = new BehaviorSubject<boolean>(false);

  constructor(
    protected toastsService: ToastsService,
    private localStorageService: LocalStorageService
  ) {
    super('[SERVICE][STORAGE]', toastsService);
  }

  /**
   * Saving in progress observable
   */
  public saving(): Observable<boolean> {
    return this.saving$.asObservable().pipe(distinctUntilChanged());
  }

  /**
   * Set saving in progress to true
   */
  public initiateSaving() {
    this.saving$.next(true);
  }

  /**
   * Load data from JSON storage.
   * Handles storage failure.
   *
   * Path can be a file 'key', that will retrieve the corresponding file from the user data storage folder:
   * 'settings' --> /%USER_DATA%/mockoon/storage/settings.json
   *
   * @param path - storage file full path or key
   */
  public loadData<T>(path: string): Observable<T> {
    return from(MainAPI.invoke<T>('APP_READ_JSON_DATA', path)).pipe(
      catchError((error) => {
        this.logMessage('error', 'STORAGE_LOAD_ERROR', { path, error });

        return EMPTY;
      })
    );
  }

  /**
   * Save data to a file.
   * Switch saving flag during save.
   * Handles storage failure.
   *
   * Path can be a file 'key', that will retrieve the corresponding file from the user data storage folder:
   * 'settings' --> /%USER_DATA%/mockoon/storage/settings.json
   *
   * @param data - data to save
   * @param path - storage file full path or key
   * @returns
   */
  public saveData<T>(data: T, path: string, storagePrettyPrint?: boolean) {
    const basePath = this.localStorageService.getItem('basePath');
    if (!basePath) return EMPTY;
    console.log('basePath: ', basePath);
    console.log('path: ', path);

    if (!path.includes(basePath)) path = basePath + path;

    console.log('FinalPath: ', path);

    return of(true).pipe(
      mergeMap(() =>
        from(
          MainAPI.invoke<T>(
            'APP_WRITE_JSON_DATA',
            this.getRelativePathData(data),
            path,
            storagePrettyPrint
          )
        ).pipe(
          catchError((error) => {
            this.logMessage('error', 'STORAGE_SAVE_ERROR', { path, error });

            return EMPTY;
          }),
          tap(() => {
            this.saving$.next(false);
          })
        )
      )
    );
  }

  private getRelativePathData<T>(data: T) {
    const relativeData = loadash.cloneDeep(data);
    const basePath = this.localStorageService.getItem('basePath');

    if (relativeData && relativeData['environments']) {
      relativeData['environments'].forEach(env => {
        env.path = env.path.split(basePath)[1];
      });
    }

    return relativeData;
  }
}

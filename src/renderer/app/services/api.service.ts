import { Injectable, NgZone } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { distinctUntilChanged, filter, map, tap } from 'rxjs/operators';
import { ChangelogModalComponent } from 'src/renderer/app/components/modals/changelog-modal/changelog-modal.component';
import { SettingsModalComponent } from 'src/renderer/app/components/modals/settings-modal/settings-modal.component';
import { MainAPI } from 'src/renderer/app/constants/common.constants';
import { EnvironmentsService } from 'src/renderer/app/services/environments.service';
import { EventsService } from 'src/renderer/app/services/events.service';
import { ImportExportService } from 'src/renderer/app/services/import-export.service';
import { LocalStorageService } from 'src/renderer/app/services/local-storage.service';
import { SettingsService } from 'src/renderer/app/services/settings.service';
import { Store } from 'src/renderer/app/stores/store';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(
    private localStorageService: LocalStorageService,
    private environmentsService: EnvironmentsService,
    private eventsService: EventsService,
    private modalService: NgbModal,
    private importExportService: ImportExportService,
    private settingsService: SettingsService,
    private store: Store,
    private zone: NgZone
  ) { }

  public init(
    changelogModal: ChangelogModalComponent,
    settingsModal: SettingsModalComponent
  ) {
    MainAPI.receive('APP_UPDATE_AVAILABLE', () => {
      this.zone.run(() => {
        this.eventsService.updateAvailable$.next(true);
      });
    });

    // set listeners on main process messages
    MainAPI.receive('APP_MENU', (action) => {
      this.zone.run(async () => {
        switch (action) {
          case 'NEW_ENVIRONMENT':
            this.environmentsService.addEnvironment().subscribe();
            break;
          case 'NEW_ENVIRONMENT_CLIPBOARD':
            this.environmentsService.newEnvironmentFromClipboard().subscribe();
            break;
          case 'OPEN_ENVIRONMENT':
            this.environmentsService.openEnvironment().subscribe();
            break;
          case 'DUPLICATE_ENVIRONMENT':
            this.environmentsService.duplicateEnvironment().subscribe();
            break;
          case 'CLOSE_ENVIRONMENT':
            this.environmentsService.closeEnvironment().subscribe();
            break;
          case 'NEW_ROUTE':
            this.environmentsService.addRoute();
            break;
          case 'NEW_ROUTE_CLIPBOARD':
            this.environmentsService.addRouteFromClipboard().subscribe();
            break;
          case 'START_ENVIRONMENT':
            this.environmentsService.toggleEnvironment();
            break;
          case 'START_ALL_ENVIRONMENTS':
            this.environmentsService.toggleAllEnvironments();
            break;
          case 'DUPLICATE_ROUTE':
            this.environmentsService.duplicateRoute();
            break;
          case 'DELETE_ROUTE':
            this.environmentsService.removeRoute();
            break;
          case 'PREVIOUS_ENVIRONMENT':
            this.environmentsService.setActiveEnvironment('previous');
            break;
          case 'NEXT_ENVIRONMENT':
            this.environmentsService.setActiveEnvironment('next');
            break;
          case 'PREVIOUS_ROUTE':
            this.environmentsService.setActiveRoute('previous');
            break;
          case 'NEXT_ROUTE':
            this.environmentsService.setActiveRoute('next');
            break;
          case 'OPEN_SETTINGS':
            this.modalService.dismissAll();
            settingsModal.showModal();
            break;
          case 'OPEN_CHANGELOG':
            this.modalService.dismissAll();
            changelogModal.showModal();
            break;
          case 'IMPORT_OPENAPI_FILE':
            this.importExportService.importOpenAPIFile();
            break;
          case 'EXPORT_OPENAPI_FILE':
            this.importExportService.exportOpenAPIFile();
            break;
        }
      });
    });

    // listen to custom protocol queries
    MainAPI.receive('APP_CUSTOM_PROTOCOL', (action, parameters) => {
      // Entry point into angular application for custom protocol.

      console.log('Inside API receive');
      this.zone.run(() => {
        // Set the settings path.
        this.localStorageService.setItem('settingPath', parameters.url);
        this.settingsService.loadSettings().subscribe();
        this.settingsService.saveSettings().subscribe();
        this.environmentsService.loadEnvironments().subscribe();
        this.environmentsService.saveEnvironments().subscribe();

        switch (action) {
          case 'load-settings':
            this.environmentsService
              .newEnvironmentsFromURL(parameters.url);
            break;

          case 'load-environment':
          case 'load-export-data':
            this.environmentsService
              .newEnvironmentFromURL(parameters.url)
              .subscribe();
            break;
        }
      });
    });

    // listen to file external changes
    MainAPI.receive(
      'APP_FILE_EXTERNAL_CHANGE',
      (previousUUID: string, environmentPath: string) => {
        this.zone.run(() => {
          this.environmentsService
            .reloadEnvironment(previousUUID, environmentPath).subscribe();
        });
      }
    );

    // listen to environments and enable/disable some menu entries
    this.store
      .select('environments')
      .pipe(
        distinctUntilChanged(),
        tap((environments) => {
          MainAPI.send(
            environments.length >= 1
              ? 'APP_ENABLE_ENVIRONMENT_MENU_ENTRIES'
              : 'APP_DISABLE_ENVIRONMENT_MENU_ENTRIES'
          );
        })
      )
      .subscribe();

    this.store
      .selectActiveEnvironment()
      .pipe(
        filter((activeEnvironment) => !!activeEnvironment),
        distinctUntilChanged(),
        map((activeEnvironment) => activeEnvironment.routes),
        tap((routes) => {
          MainAPI.send(
            routes.length >= 1
              ? 'APP_ENABLE_ROUTE_MENU_ENTRIES'
              : 'APP_DISABLE_ROUTE_MENU_ENTRIES'
          );
        })
      )
      .subscribe();
  }
}

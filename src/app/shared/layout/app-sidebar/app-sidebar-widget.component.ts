import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar-widget',
  template: `
      <div class="p-4 border-t border-gray-200 dark:border-gray-800">

        <div
          class="rounded-2xl bg-gray-100 dark:bg-gray-800 p-4"
        >
          <p class="text-sm font-semibold text-gray-900 dark:text-white">
            DSCS
          </p>

          <p class="mt-1 text-xs text-gray-500">
            Monitoreo de Servidores
          </p>
        </div>

      </div>
  `
})
export class SidebarWidgetComponent {} 
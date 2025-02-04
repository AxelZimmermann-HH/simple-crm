import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDrawer } from '@angular/material/sidenav';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatToolbarModule, MatIconModule, MatSidenavModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'simple-crm';
  showFiller = false;
  @ViewChild('drawer') drawer!: MatDrawer;
  drawerMode: 'side' | 'over' = 'side';
  drawerOpened = true;

  constructor(private router: Router, private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe(['(max-width: 1400px)'])
      .subscribe(result => {
        if (result.matches) {
          this.drawerMode = 'over'; // Auf kleinen Bildschirmen überlagert
          this.drawerOpened = false; // Standardmäßig geschlossen
        } else {
          this.drawerMode = 'side'; // Große Bildschirme: Sidebar sichtbar
          this.drawerOpened = true;
        }
      });
  }

  toggleDrawer(): void {
    if (this.drawerMode === 'over') {
      this.drawer.toggle();
    }
  }

}


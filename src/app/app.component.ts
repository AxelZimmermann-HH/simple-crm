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

  /**
   * Component constructor for the main layout. Checking the window size and modifing the drawer mode.
   * @param router for navigating 
   * @param breakpointObserver for tracking the window width
   */
  constructor(private router: Router, private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe(['(max-width: 1400px)'])
      .subscribe(result => {
        if (result.matches) {
          this.drawerMode = 'over'; 
          this.drawerOpened = false; 
        } else {
          this.drawerMode = 'side'; 
          this.drawerOpened = true;
        }
      });
  }

  /**
   * Showing or hiding the sidebar.
   */
  toggleDrawer(): void {
    if (this.drawerMode === 'over') {
      this.drawer.toggle();
    }
  }
}
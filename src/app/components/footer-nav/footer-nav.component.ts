import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-footer-nav',
  standalone: true,
  imports: [IonicModule, RouterModule, CommonModule],
  template: `
    <ion-footer class="footer-nav">
      <ion-toolbar>
        <ion-grid class="nav-grid">
          <ion-row>
            <ion-col size="3" class="ion-text-center">
              <ion-button 
                fill="clear" 
                routerLink="/home" 
                routerDirection="root"
                [class.active]="currentRoute === '/home'"
                class="nav-button">
                <ion-icon name="home-outline"></ion-icon><br />
                <ion-label>Inicio</ion-label>
              </ion-button>
            </ion-col>
            <ion-col size="3" class="ion-text-center">
              <ion-button 
                fill="clear" 
                routerLink="/rondas" 
                routerDirection="root"
                [class.active]="currentRoute === '/rondas'"
                class="nav-button">
                <ion-icon name="walk-outline"></ion-icon><br />
                <ion-label>Rondas</ion-label>
              </ion-button>
            </ion-col>
            <ion-col size="3" class="ion-text-center">
              <ion-button 
                fill="clear" 
                routerLink="/incidentes" 
                routerDirection="root"
                [class.active]="currentRoute === '/incidentes'"
                class="nav-button">
                <ion-icon name="alert-circle-outline"></ion-icon><br />
                <ion-label>Incidentes</ion-label>
              </ion-button>
            </ion-col>
            <ion-col size="3" class="ion-text-center">
              <ion-button 
                fill="clear" 
                routerLink="/perfil" 
                routerDirection="root"
                [class.active]="currentRoute === '/perfil'"
                class="nav-button">
                <ion-icon name="person-circle-outline"></ion-icon><br />
                <ion-label>Perfil</ion-label>
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </ion-toolbar>
    </ion-footer>
  `,
  styleUrls: ['./footer-nav.component.scss']
})
export class FooterNavComponent {
  currentRoute: string = '';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url;
      });
  }
}
import { Component, ViewChild, ElementRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, AnimationController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
//import { FooterNavComponent } from '../../components/footer-nav/footer-nav.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

interface Actividad {
  tipo: 'ronda' | 'incidente' | 'sistema';
  descripcion: string;
  tiempo: string;
  id?: string;
  prioridad?: 'alta' | 'media' | 'baja';
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, CommonModule, MatButtonModule, MatIconModule, MatCardModule, /*FooterNavComponent*/],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('homeContent', { read: ElementRef }) homeContent!: ElementRef;
  
  user = localStorage.getItem('safewatch_user') || 'Guardia';
  horaActual: string = '';
  fechaActual: string = '';
  totalRondas: number = 0;
  totalIncidentes: number = 0;
  actividadReciente: Actividad[] = [];
  refreshing: boolean = false;
  private intervalId: any;
  private dataRefreshInterval: any;

  constructor(
    private router: Router,
    private animationCtrl: AnimationController,
    private storage: StorageService,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.actualizarHora();
    this.actualizarFecha();
    this.actualizarDatos();
    
    this.intervalId = setInterval(() => {
      this.actualizarHora();
    }, 60000);
    
    this.dataRefreshInterval = setInterval(() => {
      this.actualizarDatos();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.dataRefreshInterval) {
      clearInterval(this.dataRefreshInterval);
    }
  }

  ngAfterViewInit() {
    this.animateContent();
  }

  private animateContent() {
    const animation = this.animationCtrl.create()
      .addElement(this.homeContent.nativeElement)
      .duration(800)
      .fromTo('opacity', '0', '1')
      .fromTo('transform', 'translateY(30px) scale(0.95)', 'translateY(0) scale(1)');
    
    animation.play();
  }

  private actualizarHora() {
    const ahora = new Date();
    this.horaActual = ahora.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  private actualizarFecha() {
    const ahora = new Date();
    this.fechaActual = ahora.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  async actualizarDatos() {
    this.refreshing = true;
    
    try {
      const rondas = this.storage.getRondas();
      const incidentes = this.storage.getIncidentes();
      
      this.totalRondas = rondas.length;
      this.totalIncidentes = incidentes.length;
      
      this.generarActividadReciente(rondas, incidentes);
      
      // Simular tiempo de carga
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('Error al actualizar datos:', error);
    } finally {
      this.refreshing = false;
    }
  }

  private generarActividadReciente(rondas: any[], incidentes: any[]) {
    const nuevasActividades: Actividad[] = [];
    
    rondas.slice(0, 3).forEach(ronda => {
      nuevasActividades.push({
        tipo: 'ronda',
        descripcion: `Ronda en ${ronda.area}`,
        tiempo: this.calcularTiempoRelativo(ronda.fecha),
        id: ronda.id,
        prioridad: 'baja'
      });
    });
    
    incidentes.slice(0, 2).forEach(incidente => {
      const prioridad = this.getPrioridadIncidente(incidente.gravedad);
      nuevasActividades.push({
        tipo: 'incidente',
        descripcion: `Incidente: ${incidente.tipo}`,
        tiempo: this.calcularTiempoRelativo(incidente.fecha),
        id: incidente.id,
        prioridad: prioridad
      });
    });
    
    //ordenar tiempo
    nuevasActividades.sort((a, b) => {

      return 0;
    });
    
    this.actividadReciente = nuevasActividades.slice(0, 5);
  }

  private getPrioridadIncidente(gravedad: string): 'alta' | 'media' | 'baja' {
    switch(gravedad.toLowerCase()) {
      case 'alta': return 'alta';
      case 'media': return 'media';
      case 'baja': return 'baja';
      default: return 'media';
    }
  }

  private calcularTiempoRelativo(fechaString: string): string {
    try {
      const fecha = new Date(fechaString);
      if (isNaN(fecha.getTime())) {
        return 'Fecha inválida';
      }
      
      const ahora = new Date();
      const diffMs = ahora.getTime() - fecha.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'Ahora mismo';
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours} h`;
      return `Hace ${diffDays} d`;
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  getIncidentClass(): string {
    if (this.totalIncidentes === 0) return 'gradient-success';
    if (this.totalIncidentes <= 2) return 'gradient-warning';
    return 'gradient-danger';
  }

  getIncidentTrendClass(): string {
    if (this.totalIncidentes === 0) return 'stable';
    return this.totalIncidentes > 5 ? 'trend-down' : 'trend-up';
  }

  getIncidentTrendIcon(): string {
    const trendClass = this.getIncidentTrendClass();
    switch(trendClass) {
      case 'trend-up': return 'trending-up';
      case 'trend-down': return 'trending-down';
      default: return 'pulse';
    }
  }

  getIncidentTrendText(): string {
    if (this.totalIncidentes === 0) return 'Estable';
    return this.totalIncidentes > 5 ? '+3 ayer' : '+1 ayer';
  }

  getActivityIcon(tipo: string): string {
    switch(tipo) {
      case 'ronda': return 'footsteps';
      case 'incidente': return 'warning';
      default: return 'notifications';
    }
  }

  getActivityTypeIcon(tipo: string): string {
    switch(tipo) {
      case 'ronda': return 'location';
      case 'incidente': return 'alert-circle';
      default: return 'cog';
    }
  }

  getActivityTypeText(tipo: string): string {
    switch(tipo) {
      case 'ronda': return 'Ronda';
      case 'incidente': return 'Incidente';
      default: return 'Sistema';
    }
  }

  getActivityPriority(actividad: Actividad): string {
    return actividad.prioridad || 'media';
  }

  getPriorityIcon(actividad: Actividad): string {
    const prioridad = this.getActivityPriority(actividad);
    switch(prioridad) {
      case 'alta': return 'alert';
      case 'media': return 'time';
      case 'baja': return 'checkmark';
      default: return 'help';
    }
  }

  trackByActividad(index: number, actividad: Actividad): string {
    return actividad.id || index.toString();
  }

  async mostrarEmergencia() {
    const alert = await this.alertCtrl.create({
      header: '🚨 Emergencia',
      message: '¿Está seguro de que desea activar la alerta de emergencia? Esta acción notificará a todo el personal de seguridad.',
      cssClass: 'emergency-alert',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'alert-cancel'
        },
        {
          text: 'Activar Alerta',
          cssClass: 'alert-confirm',
          handler: () => {
            this.activarAlertaEmergencia();
          }
        }
      ]
    });
    
    await alert.present();
  }

  private activarAlertaEmergencia() {
    console.log('Alerta de emergencia activada');
  }
  goToRondas() {
    this.router.navigate(['/rondas']);
  }
  goToIncidentes() {
    this.router.navigate(['/incidentes']);
  }
  goToPerfil() {
    this.router.navigate(['/perfil']);
  }
}
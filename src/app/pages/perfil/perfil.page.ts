import { Component, OnInit } from '@angular/core';
import { 
  IonicModule, 
  AlertController, 
  ModalController,
  ToastController 
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from '../../services/storage.service';
//import { FooterNavComponent } from '../../components/footer-nav/footer-nav.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [IonicModule, CommonModule, /*FooterNavComponent*/],
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss']
})
export class PerfilPage implements OnInit {
  user = localStorage.getItem('safewatch_user') || 'Guardia';
  totalRondasHoy: number = 0;
  totalIncidentesHoy: number = 0;
  horasServicio: number = 8;
  
  // informacion perfil
  perfilData = {
    nombre: '',
    telefono: '+56 9 1234 5678',
    turno: 'Nocturno (22:00 - 06:00)',
    zona: 'Edificio Principal + Estacionamiento',
    email: 'guardia@seguridad.cl'
  };

  // estadisticas sem
  estadisticasSemanales = {
    rondas: 0,
    incidentes: 0,
    horasTrabajadas: 0
  };

  constructor(
    private router: Router,
    private storage: StorageService,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.cargarPerfil();
    this.actualizarEstadisticas();
    this.calcularEstadisticasSemanales();
  }

  private cargarPerfil() {
    const usuarioGuardado = localStorage.getItem('safewatch_user');
    this.perfilData.nombre = usuarioGuardado || 'Guardia de Seguridad';
    
  
    const perfilCompleto = localStorage.getItem('perfil_data');
    if (perfilCompleto) {
      Object.assign(this.perfilData, JSON.parse(perfilCompleto));
    }
  }

  private actualizarEstadisticas() {
    try {
      const rondasHoy = this.storage.getRondasHoy();
      const incidentesHoy = this.storage.getIncidentesHoy();
      
      this.totalRondasHoy = rondasHoy.length;
      this.totalIncidentesHoy = incidentesHoy.length;
      
      this.calcularHorasServicio();
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }

  private calcularHorasServicio() {
    const ahora = new Date();
    const inicioTurno = new Date();
    inicioTurno.setHours(22, 0, 0, 0);
    
    if (ahora.getHours() < 6) {
      inicioTurno.setDate(inicioTurno.getDate() - 1);
    }
    
    const diferenciaMs = ahora.getTime() - inicioTurno.getTime();
    const horasTrabajadas = Math.max(0, Math.min(8, diferenciaMs / (1000 * 60 * 60)));
    this.horasServicio = Math.round(horasTrabajadas * 10) / 10;
  }

  private calcularEstadisticasSemanales() {
    this.estadisticasSemanales = {
      rondas: 42,
      incidentes: 8,
      horasTrabajadas: 48
    };
  }

  getGuardId(): string {
    const userName = this.user || 'guardia';
    const prefix = userName.slice(0, 3).toUpperCase();
    return `G-${prefix}1025`;
  }

  getIniciales(): string {
    return this.perfilData.nombre
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  async editarPerfil() {
    const alert = await this.alertCtrl.create({
      header: 'Editar Perfil',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre completo',
          value: this.perfilData.nombre
        },
        {
          name: 'email',
          type: 'email',
          placeholder: 'Correo electrónico',
          value: this.perfilData.email
        },
        {
          name: 'telefono',
          type: 'tel',
          placeholder: 'Teléfono de contacto',
          value: this.perfilData.telefono
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            this.guardarCambiosPerfil(data);
          }
        }
      ]
    });

    await alert.present();
  }

  private async guardarCambiosPerfil(data: any) {
    try {
      Object.assign(this.perfilData, data);
      localStorage.setItem('perfil_data', JSON.stringify(this.perfilData));
      localStorage.setItem('safewatch_user', data.nombre);
      
      await this.mostrarToast('Perfil actualizado correctamente', 'success');
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      await this.mostrarToast('Error al actualizar el perfil', 'danger');
    }
  }

  async configurarAlertas() {
    const alert = await this.alertCtrl.create({
      header: 'Configurar Alertas',
      message: 'Seleccione los tipos de notificaciones que desea recibir:',
      inputs: [
        {
          name: 'alertasRondas',
          type: 'checkbox',
          label: 'Recordatorios de rondas',
          value: 'rondas',
          checked: true
        },
        {
          name: 'alertasIncidentes',
          type: 'checkbox',
          label: 'Alertas de incidentes críticos',
          value: 'incidentes',
          checked: true
        },
        {
          name: 'alertasSistema',
          type: 'checkbox',
          label: 'Notificaciones del sistema',
          value: 'sistema',
          checked: false
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (selected) => {
            this.guardarConfiguracionAlertas(selected);
          }
        }
      ]
    });

    await alert.present();
  }

  private async guardarConfiguracionAlertas(alertas: string[]) {
    localStorage.setItem('config_alertas', JSON.stringify(alertas));
    await this.mostrarToast('Configuración de alertas guardada', 'success');
  }

  async cerrarSesion() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar Sesión',
      message: '¿Está seguro de que desea cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          role: 'confirm',
          handler: () => {
            this.ejecutarCierreSesion();
          }
        }
      ]
    });
    
    await alert.present();
  }

  private ejecutarCierreSesion() {
    try {
      localStorage.clear();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  private async mostrarToast(mensaje: string, color: string = 'success') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }
}
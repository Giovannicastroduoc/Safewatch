
import { Component, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { 
  IonicModule, 
  AnimationController, 
  ToastController, 
  AlertController,
  LoadingController 
} from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { FooterNavComponent } from '../../components/footer-nav/footer-nav.component';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../../services/storage.service';
import { Ronda } from '../../models/ronda.model';

@Component({
  selector: 'app-rondas',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,/* FooterNavComponent*/],
  templateUrl: './rondas.page.html',
})
export class RondasPage implements AfterViewInit {
  @ViewChildren('rondaCard') rondaCards!: QueryList<any>;
  
  area = '';
  notas = '';
  ubicacion = '';
  rondas: Ronda[] = [];
  areasPredefinidas = [
    'Edificio A',
    'Edificio B', 
    'Estacionamiento Norte',
    'Estacionamiento Sur',
    'Perímetro Este',
    'Perímetro Oeste',
    'Zona de Carga',
    'Área Común'
  ];
  

  areaValida = true;
  notasValidas = true;
  cargandoUbicacion = false;

  constructor(
    private storage: StorageService,
    private animationCtrl: AnimationController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController
  ) {
    this.cargarRondas();
  }

  private async cargarRondas() {
    const loading = await this.mostrarLoading('Cargando rondas...');
    
    try {
      this.rondas = this.storage.getRondas();
      await loading.dismiss();
    } catch (error) {
      console.error('Error al cargar rondas:', error);
      await loading.dismiss();
      await this.mostrarToast('Error al cargar las rondas', 'danger');
    }
  }

  ngAfterViewInit() {
    this.animateExistingCards();
    this.rondaCards.changes.subscribe(() => {
      this.animateNewCards();
    });
  }

  private animateExistingCards() {
    const cards = this.rondaCards.toArray();
    cards.forEach((card, index) => {
      const animation = this.animationCtrl.create()
        .addElement(card.nativeElement)
        .duration(400)
        .delay(index * 100)
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'translateX(50px)', 'translateX(0)');
      
      animation.play();
    });
  }

  private animateNewCards() {
    const newCard = this.rondaCards.first;
    if (newCard) {
      const animation = this.animationCtrl.create()
        .addElement(newCard.nativeElement)
        .duration(600)
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'scale(0.8)', 'scale(1)');
      
      animation.play();
    }
  }

  async obtenerUbicacion() {
    this.cargandoUbicacion = true;
    
    if (!navigator.geolocation) {
      this.cargandoUbicacion = false;
      await this.mostrarToast('La geolocalización no está disponible', 'warning');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      this.ubicacion = `Lat: ${position.coords.latitude.toFixed(6)}, Lng: ${position.coords.longitude.toFixed(6)}`;
      await this.mostrarToast('Ubicación obtenida correctamente', 'success');
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      await this.mostrarToast('No se pudo obtener la ubicación', 'warning');
    } finally {
      this.cargandoUbicacion = false;
    }
  }

  async registrarRonda() {
    //validacion
    this.validarFormulario();
    
    if (!this.areaValida || !this.notasValidas) {
      await this.mostrarToast('Por favor, complete todos los campos correctamente', 'warning');
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Ronda',
      message: '¿Está seguro de que desea registrar esta ronda?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Registrar',
          handler: () => this.procesarRegistroRonda()
        }
      ]
    });

    await alert.present();
  }

  private async procesarRegistroRonda() {
    const loading = await this.mostrarLoading('Registrando ronda...');

    try {
      const nuevaRonda: Ronda = {
        id: uuidv4(),
        fecha: new Date().toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
        area: this.area.trim(),
        notas: this.notas.trim(),
        ubicacion: this.ubicacion || 'No registrada'
      };

      this.storage.saveRonda(nuevaRonda);
      this.rondas.unshift(nuevaRonda);
      
      await loading.dismiss();
      await this.mostrarToast('Ronda registrada exitosamente', 'success');
      this.limpiarFormulario();

    } catch (error) {
      console.error('Error al registrar ronda:', error);
      await loading.dismiss();
      await this.mostrarToast('Error al registrar la ronda', 'danger');
    }
  }

  validarFormulario() {
    this.areaValida = !!this.area?.trim();
    this.notasValidas = !!this.notas?.trim() && this.notas.trim().length >= 5;
  }

  private limpiarFormulario() {
    this.area = '';
    this.notas = '';
    this.ubicacion = '';
    this.areaValida = true;
    this.notasValidas = true;
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

  private async mostrarLoading(mensaje: string) {
    const loading = await this.loadingCtrl.create({
      message: mensaje,
      spinner: 'crescent'
    });
    await loading.present();
    return loading;
  }

  trackByRondaId(index: number, ronda: Ronda): string {
    return ronda.id;
  }
}
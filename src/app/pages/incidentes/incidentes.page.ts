import { Component, ViewChildren, QueryList, AfterViewInit, OnInit, ElementRef } from '@angular/core';
import { IonicModule, AnimationController,  ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { StorageService } from '../../services/storage.service';
//import { FooterNavComponent } from '../../components/footer-nav/footer-nav.component';
import { Incidente } from '../../models/incidente.model';





@Component({
  selector: 'app-incidentes',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, /*FooterNavComponent*/],
  templateUrl: './incidentes.page.html',
  styleUrls: ['./incidentes.page.scss']
})
export class IncidentesPage implements OnInit, AfterViewInit {
  @ViewChildren('incidenteCard') incidenteCards!: QueryList<any>;
  
  tipo = '';
  gravedad: 'Baja' | 'Media' | 'Alta' = 'Baja';
  descripcion = '';
  
  incidentes: Incidente[] = [];
  isLoading = false;
  formSubmitted = false;

  constructor(
    private storage: StorageService,
    private animationCtrl: AnimationController,
    private toastCtrl: ToastController,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.cargarIncidentes();
  }

  ngAfterViewInit() {
    this.animateExistingCards();
    this.incidenteCards.changes.subscribe(() => {
      this.animateNewCards();
    });
  }

  public cargarIncidentes() {
    try {
      this.incidentes = this.storage.getIncidentes();
    } catch (error) {
      console.error('Error al cargar incidentes:', error);
      this.mostrarToast('Error al cargar los incidentes', 'danger');
    }
  }

  getSeverityColor(gravedad: string): string {
    switch(gravedad.toLowerCase()) {
      case 'alta': return 'danger';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'medium';
    }
  }

  getSeverityIcon(gravedad: string): string {
    switch(gravedad.toLowerCase()) {
      case 'alta': return 'alert-triangle-outline';
      case 'media': return 'warning-outline';
      case 'baja': return 'alert-circle-outline';
      default: return 'help-outline';
    }
  }

  private validarFormulario(): boolean {
    this.formSubmitted = true;

    if (!this.tipo?.trim()) {
      this.mostrarToast('Ingrese el tipo de incidente', 'warning');
      return false;
    }

    if (!this.descripcion?.trim()) {
      this.mostrarToast('Ingrese una descripción del incidente', 'warning');
      return false;
    }

    if (this.descripcion.trim().length < 10) {
      this.mostrarToast('La descripción debe tener al menos 10 caracteres', 'warning');
      return false;
    }

    return true;
  }

  public async reportarIncidente() {
    if (!this.validarFormulario()) {
      return;
    }

    this.isLoading = true;

    try {
      const nuevoIncidente: Incidente = {
        id: uuidv4(),
        tipo: this.tipo.trim(),
        gravedad: this.gravedad,
        descripcion: this.descripcion.trim(),
        fecha: new Date().toLocaleString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }),
      };

      this.storage.saveIncidente(nuevoIncidente);
      this.incidentes.unshift(nuevoIncidente);
      
      await this.mostrarToast('Incidente reportado exitosamente', 'success');
      this.limpiarFormulario();

    } catch (error) {
      console.error('Error al reportar incidente:', error);
      await this.mostrarToast('Error al reportar el incidente', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  private limpiarFormulario() {
    this.tipo = '';
    this.descripcion = '';
    this.gravedad = 'Baja';
    this.formSubmitted = false;
  }

  private async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 3000,
      color: color,
      position: 'top',
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    
    await toast.present();
  }

  private animateExistingCards() {
    const cards = this.incidenteCards.toArray();
    cards.forEach((card, index) => {
      const animation = this.animationCtrl.create()
        .addElement(card.nativeElement)
        .duration(400)
        .delay(index * 100)
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'translateX(-50px)', 'translateX(0)');
      
      animation.play();
    });
  }

  private animateNewCards() {
    const newCard = this.incidenteCards.first;
    if (newCard) {
      const animation = this.animationCtrl.create()
        .addElement(newCard.nativeElement)
        .duration(600)
        .fromTo('opacity', '0', '1')
        .fromTo('transform', 'scale(0.8)', 'scale(1)');
      
      animation.play();
    }
  }

  trackByIncidenteId(index: number, incidente: Incidente): string {
    return incidente.id;
  }

  public scrollToForm() {
    const formSection = this.elementRef.nativeElement.querySelector('.form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
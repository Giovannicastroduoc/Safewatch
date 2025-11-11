import { Injectable } from '@angular/core';
import { Ronda } from '../models/ronda.model';
import { Incidente } from '../models/incidente.model';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private keyRondas = 'safewatch_rondas';
  private keyIncidentes = 'safewatch_incidentes';
  private keyUsuario = 'safewatch_user_data';

  //rondas
  saveRonda(ronda: Ronda) {
    const data = this.getRondas();
    data.unshift(ronda);
    localStorage.setItem(this.keyRondas, JSON.stringify(data));
  }

  getRondas(): Ronda[] {
    return JSON.parse(localStorage.getItem(this.keyRondas) || '[]');
  }

  getRondasHoy(): Ronda[] {
    const hoy = new Date().toDateString();
    return this.getRondas().filter(r => 
      new Date(r.fecha).toDateString() === hoy
    );
  }

  //incidentes
  saveIncidente(inc: Incidente) {
    const data = this.getIncidentes();
    data.unshift(inc);
    localStorage.setItem(this.keyIncidentes, JSON.stringify(data));
  }

  getIncidentes(): Incidente[] {
    return JSON.parse(localStorage.getItem(this.keyIncidentes) || '[]');
  }

  getIncidentesHoy(): Incidente[] {
    const hoy = new Date().toDateString();
    return this.getIncidentes().filter(i => 
      new Date(i.fecha).toDateString() === hoy
    );
  }

  //datos usuario
  saveUserData(userData: any) {
    localStorage.setItem(this.keyUsuario, JSON.stringify(userData));
  }

  getUserData() {
    return JSON.parse(localStorage.getItem(this.keyUsuario) || '{}');
  }

  //limpieza
  clearAll() {
    localStorage.removeItem(this.keyRondas);
    localStorage.removeItem(this.keyIncidentes);
    localStorage.removeItem(this.keyUsuario);
    localStorage.removeItem('safewatch_user');
  }
}
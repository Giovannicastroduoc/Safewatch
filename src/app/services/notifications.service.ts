import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  
  constructor() { }

  showSuccess(message: string) { 
    console.log('✅ ' + message);
   
  }

  showError(message: string) {
    console.log('❌ ' + message);
  }

  showWarning(message: string) {
    console.log('⚠️ ' + message);
  }
}
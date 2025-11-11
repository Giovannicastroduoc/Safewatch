import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { IonicModule, AnimationController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage implements AfterViewInit {
  @ViewChild('loginFormElement', { read: ElementRef }) loginFormElement!: ElementRef;
  
  loginForm: FormGroup = this.fb.group({
    usuario: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(4)]],
  });

  focusedField: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private animationCtrl: AnimationController,
    private toastCtrl: ToastController
  ) {}

  ngAfterViewInit() {
    this.animateLogin();
  }

  private animateLogin() {
    const animation = this.animationCtrl.create()
      .addElement(this.loginFormElement.nativeElement)
      .duration(1000)
      .fromTo('opacity', '0', '1')
      .fromTo('transform', 'translateY(50px) scale(0.95)', 'translateY(0) scale(1)');
    
    animation.play();
  }

  onInputFocus(fieldName: string) {
    this.focusedField = fieldName;
  }

  onInputBlur(fieldName: string) {
    if (this.loginForm.get(fieldName)?.value === '') {
      this.focusedField = null;
    }
  }

  async iniciarSesion() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;


      const successAnimation = this.animationCtrl.create()
        .addElement(this.loginFormElement.nativeElement)
        .duration(500)
        .fromTo('transform', 'scale(1)', 'scale(1.02)')
        .fromTo('box-shadow', '0 20px 40px rgba(0,0,0,0.1)', '0 25px 50px rgba(67, 97, 238, 0.2)');
      
      successAnimation.play();
      

      setTimeout(async () => {
        try {
          localStorage.setItem('safewatch_user', this.loginForm.value.usuario || '');
          
          const toast = await this.toastCtrl.create({
            message: `¡Bienvenido ${this.loginForm.value.usuario}!`,
            duration: 2000,
            color: 'success',
            position: 'top',
            icon: 'checkmark-circle',
            cssClass: 'success-toast'
          });
          await toast.present();

          this.router.navigate(['/home']);
        } catch (error) {
          console.error('Error durante el login:', error);
          this.mostrarToast('Error al iniciar sesión', 'danger');
        } finally {
          this.isLoading = false;
        }
      }, 1500);

    } else {

      const errorAnimation = this.animationCtrl.create()
        .addElement(this.loginFormElement.nativeElement)
        .duration(300)
        .keyframes([
          { offset: 0, transform: 'translateX(0)' },
          { offset: 0.1, transform: 'translateX(-8px)' },
          { offset: 0.2, transform: 'translateX(8px)' },
          { offset: 0.3, transform: 'translateX(-8px)' },
          { offset: 0.4, transform: 'translateX(8px)' },
          { offset: 0.5, transform: 'translateX(-8px)' },
          { offset: 1, transform: 'translateX(0)' }
        ]);
      
      errorAnimation.play();
      

      this.loginForm.markAllAsTouched();
      

      if (!this.loginForm.get('usuario')?.valid) {
        this.mostrarToast('Usuario debe tener al menos 3 caracteres', 'warning');
      } else if (!this.loginForm.get('password')?.valid) {
        this.mostrarToast('Contraseña debe tener al menos 4 caracteres', 'warning');
      }
    }
  }

  private async mostrarToast(mensaje: string, color: string = 'warning') {
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
}
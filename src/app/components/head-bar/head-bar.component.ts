import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-head-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './head-bar.component.html',
  styleUrl: './head-bar.component.css'
})
export class HeadBarComponent {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/']);
  }

  openGitHub(): void {
    window.open('https://github.com/saifeddine-jmem/open-library-app', '_blank');
  }
}

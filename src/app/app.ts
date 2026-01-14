import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoadingScreenComponent } from './components/loading-screen/loading-screen.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, LoadingScreenComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  showLoading = true;

  ngOnInit(): void {
    // Hide loading screen after 2 seconds
    setTimeout(() => {
      this.showLoading = false;
    }, 2000);
  }
}

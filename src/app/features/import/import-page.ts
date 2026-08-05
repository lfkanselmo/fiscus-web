import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { ImportsService } from '../../core/services/imports.service';
import { ImportSummary } from '../../core/models/import-summary.model';

@Component({
  selector: 'app-import-page',
  imports: [MatButtonModule],
  templateUrl: './import-page.html',
  styleUrl: './import-page.scss',
})
export class ImportPage {
  private readonly importsService = inject(ImportsService);

  readonly selectedFile = signal<File | null>(null);
  readonly summary = signal<ImportSummary | null>(null);
  readonly uploading = signal(false);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
    this.summary.set(null);
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file) {
      return;
    }
    this.uploading.set(true);
    this.importsService.upload(file).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.uploading.set(false);
      },
      error: () => this.uploading.set(false),
    });
  }
}

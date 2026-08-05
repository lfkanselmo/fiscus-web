import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'centsCurrency' })
export class CentsCurrencyPipe implements PipeTransform {
  private readonly formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });

  transform(amountCents: number): string {
    return this.formatter.format(amountCents / 100);
  }
}

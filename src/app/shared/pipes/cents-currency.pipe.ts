import { Pipe, PipeTransform } from '@angular/core';

import { formatCents } from '../../core/utils/currency';

@Pipe({ name: 'centsCurrency' })
export class CentsCurrencyPipe implements PipeTransform {
  transform(amountCents: number): string {
    return formatCents(amountCents);
  }
}

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-number',
  imports: [

  ],
  templateUrl: './card-number.component.html',
  styles: ""
})
export class CardNumberComponent {
    @Input() number: number = 0;
    @Input() title: string = '';
    @Input() description: string | null = null;
    @Input() textColor: string = 'text-brand-500';
    @Input() bgColor: string = 'bg-brand-50';
    @Input() suffix: string | null = null;
}

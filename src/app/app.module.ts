import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TreeModule } from '@circlon/angular-tree-component';
import { AppComponent } from './app.component';

@NgModule({
  imports: [BrowserModule, FormsModule, TreeModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {}

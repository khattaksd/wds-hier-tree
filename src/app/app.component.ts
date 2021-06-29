import { ITreeOptions } from '@circlon/angular-tree-component';
import { Component, ViewChild } from '@angular/core';
import { TreeNode } from './tree-node';
import * as faker from 'faker';
import { BehaviorSubject, Observable } from 'rxjs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  generatedTS = new Date().toISOString();
  selectedFile: File;
  private nodesSubj = new BehaviorSubject<TreeNode[]>(null);
  nodes: Observable<TreeNode[]> = this.nodesSubj.asObservable();
  options: ITreeOptions = {
    useCheckbox: true,
    getChildren: this.getChildren.bind(this)
  };
  @ViewChild('treeRoot') treeRoot;

  init(treeSize: string, nodeNameSize: string, download = false): void {
    const tsize = Math.min(Number.parseInt(treeSize), 99999);
    const nsize = Math.min(Number.parseInt(nodeNameSize), 9);
    const root: TreeNode = { id: 0, name: 'root' };
    const nodes: TreeNode[] = [root];
    for (let i = 0; i < tsize; i++) {
      const parent: TreeNode = nodes[(Math.random() * nodes.length) | 0];
      const nodeName = faker.random.words(nsize);
      const child: TreeNode = {
        id: nodes.length,
        name: this.titleCase(nodeName)
      };
      if (parent.children) parent.children.push(child);
      else parent.children = [child];
      nodes.push(child);
    }
    this.nodesSubj.next(root.children);
    this.generatedTS = new Date().toISOString();
    if (download) {
      var blob = new Blob([JSON.stringify(root.children)], {
        type: 'text/plain;charset=utf-8'
      });
      saveAs(blob, `genearated_${this.generatedTS}.json`);
    }
  }

  getChildren(node: any) {
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve([]), 10);
    });
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(this.selectedFile, 'UTF-8');
    fileReader.onload = () => {
      const r = JSON.parse(fileReader.result.toString());
      this.nodesSubj.next(r);
    };
    fileReader.onerror = error => {
      console.log(error);
    };
  }
  private titleCase(str: string) {
    return str
      .toLowerCase()
      .split(' ')
      .map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }
}

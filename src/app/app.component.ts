import { ITreeOptions, TreeModel } from '@circlon/angular-tree-component';
import { Component, OnInit } from '@angular/core';
import { TreeNode } from './tree-node';
import * as faker from 'faker';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  genTree = {
    numNodes: 1000,
    numWords: 2,
    download: false,
  };
  gen$ = new Subject();
  generatedTS = new Date().toISOString();
  selectedFile: File;
  private nodesSubj = new BehaviorSubject<TreeNode[]>(null);
  nodes: Observable<TreeNode[]> = this.nodesSubj.asObservable();
  options: ITreeOptions = {
    useCheckbox: true,
  };

  ngOnInit(): void {
    this.gen$.subscribe(() => this.init());
  }

  gen(download = false) {
    this.genTree.download = download;
    this.gen$.next();
  }

  init() {
    this.generatedTS = new Date().toISOString();
    const tsize = Math.min(this.genTree.numNodes, 99999);
    const nsize = Math.min(this.genTree.numWords, 9);
    const root: TreeNode = { id: 0, name: 'Root', nameLC: 'root' };
    const nodes: TreeNode[] = [root];
    for (let i = 0; i < tsize; i++) {
      const parent: TreeNode = nodes[(Math.random() * nodes.length) | 0];
      let nodeName = faker.name.findName();
      if (this.genTree.numWords == 2) {
          nodeName = nodeName + ' ' + faker.name.findName();
      } else if (this.genTree.numWords == 3) {
        nodeName = nodeName + ' ' + faker.name.findName() + ' ' + faker.name.findName();
      }
      // + ' ' + faker.name.findName();
      const child: TreeNode = {
        id: nodes.length,
        name: nodeName,
        nameLC: nodeName.toLocaleLowerCase(),
      };
      if (parent.children) parent.children.push(child);
      else parent.children = [child];
      nodes.push(child);
    }
    this.nodesSubj.next(root.children);
    this.generatedTS = new Date().toISOString();
    if (this.genTree.download) {
      var blob = new Blob([JSON.stringify(root.children)], {
        type: 'text/plain;charset=utf-8',
      });
      saveAs(blob, `genearated_${this.generatedTS}.json`);
    }
    console.log('init done');
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(this.selectedFile, 'UTF-8');
    fileReader.onload = () => {
      const r = JSON.parse(fileReader.result.toString());
      this.generatedTS = 'file uploaded'
      this.nodesSubj.next(r);
    };
    fileReader.onerror = (error) => {
      console.log(error);
    };
  }

  filterFn(value: string, treeModel: TreeModel) {
    treeModel.filterNodes((node: TreeNode) => node.nameLC.includes(value.toLocaleLowerCase()));
  }

}

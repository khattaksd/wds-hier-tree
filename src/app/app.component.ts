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
    csv: false,
  };
  gen$ = new Subject();
  generatedTS = new Date().toISOString();
  selectedFile: File;
  private nodesSubj = new BehaviorSubject<TreeNode[]>(null);
  nodes: Observable<TreeNode[]> = this.nodesSubj.asObservable();
  options: ITreeOptions = {
    idField: 'value',
    displayField: 'code',
    useCheckbox: true,
  };

  ngOnInit(): void {
    this.gen$.subscribe(() => this.init());
  }

  gen(download = false, csv = false) {
    this.genTree.download = download;
    this.genTree.csv = csv;
    this.gen$.next();
  }

  init() {
    this.generatedTS = new Date().toISOString();
    const tsize = Math.min(this.genTree.numNodes, 99999);
    const nsize = Math.min(this.genTree.numWords, 9);
    const root: TreeNode = { value: null, code: 'ROOT' };
    const nodes: TreeNode[] = [root];
    for (let i = 0; i < tsize; i++) {
      const parent: TreeNode = nodes[(Math.random() * nodes.length) | 0];
      let nodeName = faker.name.findName();
      if (this.genTree.numWords == 2) {
        nodeName = nodeName + ' ' + faker.name.findName();
      } else if (this.genTree.numWords == 3) {
        nodeName =
          nodeName + ' ' + faker.name.findName() + ' ' + faker.name.findName();
      }
      const value = nodeName
        .substring(0, 5)
        .replace(/[^a-zA-Z]/g, '')
        .toUpperCase();
      const child: TreeNode = {
        value: value.padEnd(5, i + '1234'),
        code: nodeName,
        parent: parent.value,
      };
      if (parent.children) parent.children.push(child);
      else parent.children = [child];
      nodes.push(child);
    }
    this.nodesSubj.next(root.children);
    this.generatedTS = new Date().toISOString();
    var blob: Blob;
    var filename: string;
    if (this.genTree.download) {
      if (this.genTree.csv) {
        let csvlines = 'value,code,parent\r\n';
        //skip ROOT node by starting at index 1
        for (let index = 1; index < nodes.length; index++) {
          const n = nodes[index];
          csvlines += n.value + ',' + n.code;
          if (n.parent) csvlines += ',' + n.parent;
          csvlines += '\r\n';
        }
        blob = new Blob([csvlines], { type: 'data:text/csv;charset=utf-8' });
        filename = `genearated_${this.generatedTS}.csv`;
      } else {
        blob = new Blob([JSON.stringify(root.children)], {
          type: 'text/plain;charset=utf-8',
        });
        filename = `genearated_${this.generatedTS}.json`;
      }
      saveAs(blob, filename);
    }
    console.log('init done');
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(this.selectedFile, 'UTF-8');
    fileReader.onload = () => {
      const r = JSON.parse(fileReader.result.toString());
      this.generatedTS = 'file uploaded';
      this.nodesSubj.next(r);
    };
    fileReader.onerror = (error) => {
      console.log(error);
    };
  }
}

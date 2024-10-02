Logger.log('start');

import {Logger} from '../common/Logger';

import {clientStorageData, loadClientStorageData, saveClientStorageData} from './ClientStorageData';
import {initDocumentChange} from './DocumentChange';
import {exportDocument} from './export';
import {BaseDocument} from './Page/BaseDocument';
import {updateDocument} from './UpdateDocument';
import {delay} from './Utils/utils';

async function main() {
    await loadClientStorageData();

    figma.showUI(__html__, {width: clientStorageData.width, height: clientStorageData.height});

    figma.ui.postMessage({type: 'clientStorageData', data: clientStorageData}, {origin: '*'});

    figma.ui.onmessage = async (message: {type: string; data: any}) => {
        switch (message.type) {
            case 'apply': {
                const data: {target: string | undefined; filteredIds: string[] | undefined} =
                    message.data;
                if (data.target) {
                    //await updateDocument(false, data.target);
                    figma.ui.postMessage(
                        {
                            type: 'targetView',
                            data: {
                                document: BaseDocument.current,
                                target: data.target,
                            },
                        },
                        {origin: '*'},
                    );
                } else {
                    await updateDocument(true, '', data.filteredIds || []);
                    figma.ui.postMessage(
                        {
                            type: 'currentPage',
                            data: {
                                document: BaseDocument.current,
                            },
                        },
                        {origin: '*'},
                    );
                }
                break;
            }
            case 'clientStorageData':
                clientStorageData.url = message.data.url || clientStorageData.url;
                saveClientStorageData();
                break;
            case 'setPages':
                clientStorageData.pages = message.data.pages || clientStorageData.pages;
                saveClientStorageData();
                //TODO
                break;
            case 'resize':
                figma.ui.resize(message.data.w, message.data.h);
                clientStorageData.width = message.data.w;
                clientStorageData.height = message.data.h;
                saveClientStorageData();
                break;
            case 'export': {
                Logger.log('export', message);
                const data: {filteredIds: string[] | undefined} = message.data;
                await updateDocument(true, '', data.filteredIds || []);
                await exportDocument('export');
                break;
            }
            case 'exportAll': {
                Logger.log('exportAll', message);
                await updateDocument(true, '', [], true);
                await exportDocument('exportAll');
                break;
            }
            case 'exportFigma': {
                Logger.log('exportFigma', message);
                await updateDocument(true, '', [], true, true);
                await exportDocument('exportFigma');
                break;
            }
        }
        Logger.log('MSG', message);
    };

    initDocumentChange();

    figma.ui.postMessage({type: 'setLoading', data: true}, {origin: '*'});
    await delay(100);
    await updateDocument(false);

    figma.ui.postMessage(
        {
            type: 'currentPage',
            data: {
                document: BaseDocument.current,
            },
        },
        {origin: '*'},
    );

    Logger.log('STARTED');
}

main();

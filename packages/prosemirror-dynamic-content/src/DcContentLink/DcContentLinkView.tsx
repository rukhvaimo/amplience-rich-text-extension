import { WithStyles, withStyles } from '@material-ui/core';
import clsx from 'clsx';
import React  from 'react';
import ReactDOM from 'react-dom';
import { ChooserActions, ContentItem as ContentItemIcon, DeleteIcon, getContentTypeCard, getContentTypeIcon, StyledFab, Visualization, withTheme } from 'unofficial-dynamic-content-ui';
import { ContentTypeExtensionSettings, OldContentTypeExtensionSettings } from '../ContentTypeExtensionSettings';
import { DynamicContentToolOptions } from '../DynamicContentTools/DynamicContentToolOptions';
import InlineChooser from '../InlineChooser/InlineChooser';
import { environments, schemas } from './contentSchemas';

const styles = {
    root: {
        '&$broken, &$invalid': {
            background: '#e5e5e5'
        },
        boxShadow: "0 1px 5px 0 rgba(23,32,44,.2), 0 2px 2px 0 rgba(23,32,44,.1), 0 3px 1px -2px rgba(23,32,44,.1)"
    },
    invalid: {
    },
    content: {
        position: "absolute" as "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "50%"
    },
    contentName: {
        margin: "20px",
        fontsize: "20px",
    },
    statusIcons: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        position: 'absolute' as 'absolute',
        alignItems: 'center' as 'center',
        alignContent: 'center' as 'center',
        flexDirection: 'row' as 'row',
        justifyContent: 'center' as 'center'
    },
};
interface Props extends WithStyles<typeof styles> {
    options: DynamicContentToolOptions,
    node: any,
    contentTypeName: string,
    editLink: string,
    onDelete: () => void;
}

const convertSettings = (settings: ContentTypeExtensionSettings[] | OldContentTypeExtensionSettings | undefined) : OldContentTypeExtensionSettings | undefined => {
    if (settings === undefined) {
        return undefined;
    } else if (Array.isArray(settings)) {
        const result: OldContentTypeExtensionSettings = {
            cards: {},
            icons: {},
            aspectRatios: {}
        }

        settings.forEach(setting => {
            if (setting.card) {
                result.cards[setting.id] = setting.card;
            }

            if (setting.icon) {
                result.icons[setting.id] = setting.icon;
            }

            if (setting.aspectRatio && result.aspectRatios) {
                result.aspectRatios[setting.id] = setting.aspectRatio;
            }
        });

        return result;
    } else {
        return settings;
    }
}

const ViewComponent = withStyles(styles)((props: Props) => {
    const {
        node,
        onDelete,
        contentTypeName,
        editLink,
        classes,
        options,
    } = props;

    const value = node.attrs.value;
    const hasValidValue = value && value.id && value.contentType;

    const contentLinkOptions = options.tools && options.tools["dc-content-link"] ? options.tools["dc-content-link"] : undefined;

    const settings = contentLinkOptions ? convertSettings(contentLinkOptions.contentTypeSettings) : undefined;

    const customIcon: string | undefined = settings && hasValidValue
        ? getContentTypeIcon(settings, value.contentType)
        : undefined;
    const cardTemplateUrl: string | undefined = settings && hasValidValue ? getContentTypeCard(settings, value.contentType) : undefined;
    const aspectRatio = settings && settings.aspectRatios && hasValidValue ? getContentTypeAspectRatio(settings.aspectRatios, value.contentType) : undefined;

    //Workaround for ts-jest
    const Fab: any = StyledFab as any;

    return (
        <div
            className={clsx(classes.root, { [classes.invalid]: !hasValidValue })}
        >
            <InlineChooser variant="populated-slot" aspectRatio={aspectRatio || '3:1'}>

                <div
                    className={clsx(classes.content)}
                    style={{
                        backgroundImage: `url(${customIcon || ContentItemIcon})`
                    }}
                >
                    <div className={clsx(classes.contentName)} style={{textAlign: "center"}}>
                        Content Type: {contentTypeName}
                    </div>
                    {cardTemplateUrl && options && options.dynamicContent && options.dynamicContent.stagingEnvironment ? (
                        <Visualization
                            template={cardTemplateUrl}
                            params={{
                                contentItemId: value.id,
                                stagingEnvironment: options.dynamicContent.stagingEnvironment
                            }}
                        />
                    ) : (
                        false
                    )}
                </div>
                <div>
                    <ChooserActions variant="populated-slot">
                        <Fab variant="dark">
                            <a href={editLink} target={'_blank'} style={{cursor: 'pointer', height: '24px', display: 'flex'}}>
                                <svg
                                    version="1.1"
                                    id="Layer_1_cache446"
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlnsXlink="http://www.w3.org/1999/xlink"
                                    x="0px"
                                    y="0px"
                                    width="24px"
                                    height="24px"
                                    viewBox="0 0 32 32.07"
                                    enableBackground="new 0 0 32 32.07"
                                    xmlSpace="preserve"
                                    preserveAspectRatio="xMidYMid meet"
                                    focusable="false"
                                    style={{verticalAlign: "middle"}}
                                >
                                    <polygon fill="#FFFFFF" points="4.124,22.244 3.375,28.656 9.773,27.906"/>
                                    <rect
                                        x="11.119"
                                        y="6.823"
                                        transform="matrix(-0.7072 -0.707 0.707 -0.7072 13.8315 39.5483)"
                                        fill="#FFFFFF"
                                        width="7.972"
                                        height="20.174"
                                    />
                                    <path
                                        fill="#FFFFFF"
                                        d="M20.397,5.976l5.658,5.658c0,0,2.055-2.08,2.637-2.659c0.581-0.581,0.516-1.514,0-2.03
                                        c-0.518-0.519-3.105-3.109-3.597-3.599c-0.573-0.574-1.542-0.521-2.062,0C22.512,3.868,20.397,5.976,20.397,5.976z"
                                    />
                                </svg>
                            </a>
                        </Fab>
                        <Fab variant="dark" onClick={onDelete}>
                            {DeleteIcon}
                        </Fab>
                    </ChooserActions>
                </div>
            </InlineChooser>
        </div>
    );
});


export function getContentTypeAspectRatio(
    aspectRatios: { [schemaId: string]: string },
    schemaId: string
): string | undefined {
    for (const key of Object.keys(aspectRatios)) {
        if (key === "*" || key === schemaId) {
            return aspectRatios[key];
        }
    }
}

export class DcContentLinkView {
    public dom: any;
    public editLink: any;
    public contentTypeName: any

    constructor(
        private node: any,
        private view: any,
        private getPos: any,
        private options: DynamicContentToolOptions = {}) {
        this.dom = document.createElement('div');
        this.handleDelete = this.handleDelete.bind(this);
        this.beforeRender();
        this.render();
    }
    public async handleDelete(): Promise<any> {
        const start = this.getPos();
        const tr = this.view.state.tr.delete(start, start + this.node.nodeSize);
        this.view.dispatch(tr);
    }

    public async beforeRender(): Promise<void> {
        this.editLink = environments.find((item: any) => item.virtual === this.options.dynamicContent?.stagingEnvironment)?.env + this.node.attrs.value.id;
        this.contentTypeName = schemas.find((item: any) => item.schema === this.node.attrs.value.contentType)?.name;
    }

    public render(): void {
        ReactDOM.render(withTheme(<ViewComponent options={this.options} node={this.node} contentTypeName={this.contentTypeName} editLink={this.editLink} onDelete={this.handleDelete} />), this.dom);
    }
}

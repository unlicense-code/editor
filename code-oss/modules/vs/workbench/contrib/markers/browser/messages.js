/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from 'vs/nls';
import { basename } from 'vs/base/common/resources';
import { MarkerSeverity } from 'vs/platform/markers/common/markers';
export default class Messages {
    static MARKERS_PANEL_TOGGLE_LABEL = nls.localize('problems.view.toggle.label', "Toggle Problems (Errors, Warnings, Infos)");
    static MARKERS_PANEL_SHOW_LABEL = nls.localize('problems.view.focus.label', "Focus Problems (Errors, Warnings, Infos)");
    static PROBLEMS_PANEL_CONFIGURATION_TITLE = nls.localize('problems.panel.configuration.title', "Problems View");
    static PROBLEMS_PANEL_CONFIGURATION_AUTO_REVEAL = nls.localize('problems.panel.configuration.autoreveal', "Controls whether Problems view should automatically reveal files when opening them.");
    static PROBLEMS_PANEL_CONFIGURATION_VIEW_MODE = nls.localize('problems.panel.configuration.viewMode', "Controls the default view mode of the Problems view.");
    static PROBLEMS_PANEL_CONFIGURATION_SHOW_CURRENT_STATUS = nls.localize('problems.panel.configuration.showCurrentInStatus', "When enabled shows the current problem in the status bar.");
    static PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER = nls.localize('problems.panel.configuration.compareOrder', "Controls the order in which problems are navigated.");
    static PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_SEVERITY = nls.localize('problems.panel.configuration.compareOrder.severity', "Navigate problems ordered by severity");
    static PROBLEMS_PANEL_CONFIGURATION_COMPARE_ORDER_POSITION = nls.localize('problems.panel.configuration.compareOrder.position', "Navigate problems ordered by position");
    static MARKERS_PANEL_TITLE_PROBLEMS = nls.localize('markers.panel.title.problems', "Problems");
    static MARKERS_PANEL_NO_PROBLEMS_BUILT = nls.localize('markers.panel.no.problems.build', "No problems have been detected in the workspace.");
    static MARKERS_PANEL_NO_PROBLEMS_ACTIVE_FILE_BUILT = nls.localize('markers.panel.no.problems.activeFile.build', "No problems have been detected in the current file.");
    static MARKERS_PANEL_NO_PROBLEMS_FILTERS = nls.localize('markers.panel.no.problems.filters', "No results found with provided filter criteria.");
    static MARKERS_PANEL_ACTION_TOOLTIP_MORE_FILTERS = nls.localize('markers.panel.action.moreFilters', "More Filters...");
    static MARKERS_PANEL_FILTER_LABEL_SHOW_ERRORS = nls.localize('markers.panel.filter.showErrors', "Show Errors");
    static MARKERS_PANEL_FILTER_LABEL_SHOW_WARNINGS = nls.localize('markers.panel.filter.showWarnings', "Show Warnings");
    static MARKERS_PANEL_FILTER_LABEL_SHOW_INFOS = nls.localize('markers.panel.filter.showInfos', "Show Infos");
    static MARKERS_PANEL_FILTER_LABEL_EXCLUDED_FILES = nls.localize('markers.panel.filter.useFilesExclude', "Hide Excluded Files");
    static MARKERS_PANEL_FILTER_LABEL_ACTIVE_FILE = nls.localize('markers.panel.filter.activeFile', "Show Active File Only");
    static MARKERS_PANEL_ACTION_TOOLTIP_FILTER = nls.localize('markers.panel.action.filter', "Filter Problems");
    static MARKERS_PANEL_ACTION_TOOLTIP_QUICKFIX = nls.localize('markers.panel.action.quickfix', "Show fixes");
    static MARKERS_PANEL_FILTER_ARIA_LABEL = nls.localize('markers.panel.filter.ariaLabel', "Filter Problems");
    static MARKERS_PANEL_FILTER_PLACEHOLDER = nls.localize('markers.panel.filter.placeholder', "Filter (e.g. text, **/*.ts, !**/node_modules/**)");
    static MARKERS_PANEL_FILTER_ERRORS = nls.localize('markers.panel.filter.errors', "errors");
    static MARKERS_PANEL_FILTER_WARNINGS = nls.localize('markers.panel.filter.warnings', "warnings");
    static MARKERS_PANEL_FILTER_INFOS = nls.localize('markers.panel.filter.infos', "infos");
    static MARKERS_PANEL_SINGLE_ERROR_LABEL = nls.localize('markers.panel.single.error.label', "1 Error");
    static MARKERS_PANEL_MULTIPLE_ERRORS_LABEL = (noOfErrors) => { return nls.localize('markers.panel.multiple.errors.label', "{0} Errors", '' + noOfErrors); };
    static MARKERS_PANEL_SINGLE_WARNING_LABEL = nls.localize('markers.panel.single.warning.label', "1 Warning");
    static MARKERS_PANEL_MULTIPLE_WARNINGS_LABEL = (noOfWarnings) => { return nls.localize('markers.panel.multiple.warnings.label', "{0} Warnings", '' + noOfWarnings); };
    static MARKERS_PANEL_SINGLE_INFO_LABEL = nls.localize('markers.panel.single.info.label', "1 Info");
    static MARKERS_PANEL_MULTIPLE_INFOS_LABEL = (noOfInfos) => { return nls.localize('markers.panel.multiple.infos.label', "{0} Infos", '' + noOfInfos); };
    static MARKERS_PANEL_SINGLE_UNKNOWN_LABEL = nls.localize('markers.panel.single.unknown.label', "1 Unknown");
    static MARKERS_PANEL_MULTIPLE_UNKNOWNS_LABEL = (noOfUnknowns) => { return nls.localize('markers.panel.multiple.unknowns.label', "{0} Unknowns", '' + noOfUnknowns); };
    static MARKERS_PANEL_AT_LINE_COL_NUMBER = (ln, col) => { return nls.localize('markers.panel.at.ln.col.number', "[Ln {0}, Col {1}]", '' + ln, '' + col); };
    static MARKERS_TREE_ARIA_LABEL_RESOURCE = (noOfProblems, fileName, folder) => { return nls.localize('problems.tree.aria.label.resource', "{0} problems in file {1} of folder {2}", noOfProblems, fileName, folder); };
    static MARKERS_TREE_ARIA_LABEL_MARKER = (marker) => {
        const relatedInformationMessage = marker.relatedInformation.length ? nls.localize('problems.tree.aria.label.marker.relatedInformation', " This problem has references to {0} locations.", marker.relatedInformation.length) : '';
        switch (marker.marker.severity) {
            case MarkerSeverity.Error:
                return marker.marker.source ? nls.localize('problems.tree.aria.label.error.marker', "Error generated by {0}: {1} at line {2} and character {3}.{4}", marker.marker.source, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage)
                    : nls.localize('problems.tree.aria.label.error.marker.nosource', "Error: {0} at line {1} and character {2}.{3}", marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage);
            case MarkerSeverity.Warning:
                return marker.marker.source ? nls.localize('problems.tree.aria.label.warning.marker', "Warning generated by {0}: {1} at line {2} and character {3}.{4}", marker.marker.source, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage)
                    : nls.localize('problems.tree.aria.label.warning.marker.nosource', "Warning: {0} at line {1} and character {2}.{3}", marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage, relatedInformationMessage);
            case MarkerSeverity.Info:
                return marker.marker.source ? nls.localize('problems.tree.aria.label.info.marker', "Info generated by {0}: {1} at line {2} and character {3}.{4}", marker.marker.source, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage)
                    : nls.localize('problems.tree.aria.label.info.marker.nosource', "Info: {0} at line {1} and character {2}.{3}", marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage);
            default:
                return marker.marker.source ? nls.localize('problems.tree.aria.label.marker', "Problem generated by {0}: {1} at line {2} and character {3}.{4}", marker.marker.source, marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage)
                    : nls.localize('problems.tree.aria.label.marker.nosource', "Problem: {0} at line {1} and character {2}.{3}", marker.marker.message, marker.marker.startLineNumber, marker.marker.startColumn, relatedInformationMessage);
        }
    };
    static MARKERS_TREE_ARIA_LABEL_RELATED_INFORMATION = (relatedInformation) => nls.localize('problems.tree.aria.label.relatedinfo.message', "{0} at line {1} and character {2} in {3}", relatedInformation.message, relatedInformation.startLineNumber, relatedInformation.startColumn, basename(relatedInformation.resource));
    static SHOW_ERRORS_WARNINGS_ACTION_LABEL = nls.localize('errors.warnings.show.label', "Show Errors and Warnings");
}

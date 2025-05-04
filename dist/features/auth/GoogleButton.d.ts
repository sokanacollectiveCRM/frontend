declare function GoogleButton({ isLoading, onClick, text, }: {
    isLoading: any;
    onClick: any;
    text?: string | undefined;
}): import("react/jsx-runtime").JSX.Element;
declare namespace GoogleButton {
    namespace propTypes {
        let isLoading: PropTypes.Requireable<boolean>;
        let onClick: PropTypes.Validator<(...args: any[]) => any>;
        let text: PropTypes.Requireable<string>;
    }
}
export default GoogleButton;
import PropTypes from 'prop-types';
//# sourceMappingURL=GoogleButton.d.ts.map
import { useMobileNavigationBarItems } from '@/navigation/hooks/useMobileNavigationBarItems';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLocation } from 'react-router-dom';
import { themeCssVariables } from 'twenty-ui/theme';
import { isAiChatPath } from '~/utils/isAiChatPath';

// Hamania: a docked, full-width tab bar in the layout flow (Twenty floats a small pill over the page),
// so it never covers the bottom controls of a page and always reads as navigation.
const StyledNavigationBar = styled.nav`
  backdrop-filter: ${themeCssVariables.blur.strong};
  background: ${themeCssVariables.background.primary};
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex: 0 0 auto;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  position: relative;
  width: 100%;
  z-index: ${RootStackingContextZIndices.MobileNavigationBar};

  &[data-hidden] {
    display: none;
  }

  @media print {
    display: none;
  }
`;

const StyledNavigationButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  flex: 1 1 0;
  flex-direction: column;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
  min-height: ${themeCssVariables.spacing[16]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]};
  -webkit-tap-highlight-color: transparent;

  &[aria-current='page'] {
    color: ${themeCssVariables.color.blue};
  }

  &:active {
    background: ${themeCssVariables.background.transparent.light};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -4px;
  }

  & > svg {
    block-size: 28px;
    inline-size: 28px;
  }
`;

const StyledNavigationLabel = styled.span`
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MobileNavigationBar = () => {
  const { pathname } = useLocation();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const { items, activeItemName } = useMobileNavigationBarItems();

  // The chat page keeps the keyboard up and carries its own close button.
  const isHidden = isSidePanelOpened || isAiChatPath(pathname);

  return (
    <StyledNavigationBar
      data-hidden={isHidden ? '' : undefined}
      aria-hidden={isHidden}
      inert={isHidden || undefined}
    >
      {items.map(({ Icon, name, label, onClick }) => (
        <StyledNavigationButton
          key={name}
          type="button"
          aria-current={activeItemName === name ? 'page' : undefined}
          onClick={onClick}
          tabIndex={isHidden ? -1 : 0}
        >
          <Icon aria-hidden />
          <StyledNavigationLabel>{label}</StyledNavigationLabel>
        </StyledNavigationButton>
      ))}
    </StyledNavigationBar>
  );
};

/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { useState } from "react";
import { observer } from "mobx-react";
// plane imports
import { useTranslation } from "@plane/i18n";
import { TOAST_TYPE, setToast } from "@plane/propel/toast";
import { AlertModalCore } from "@plane/ui";
// hooks
import { useUser } from "@/hooks/store/user";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const SignOutConfirmationModal = observer(function SignOutConfirmationModal(props: Props) {
  const { isOpen, onClose } = props;
  // states
  const [isSigningOut, setIsSigningOut] = useState(false);
  // store hooks
  const { signOut } = useUser();
  // translation
  const { t } = useTranslation();

  const handleClose = () => {
    setIsSigningOut(false);
    onClose();
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut()
      .then(() => handleClose())
      .catch(() => {
        setToast({
          type: TOAST_TYPE.ERROR,
          title: t("auth.sign_out.toast.error.title"),
          message: t("auth.sign_out.toast.error.message"),
        });
        setIsSigningOut(false);
      });
  };

  return (
    <AlertModalCore
      isOpen={isOpen}
      handleClose={handleClose}
      handleSubmit={handleSignOut}
      isSubmitting={isSigningOut}
      variant="primary"
      title={t("auth.sign_out.confirm.title")}
      content={t("auth.sign_out.confirm.description")}
      primaryButtonText={{
        default: t("sign_out"),
        loading: t("signing_out"),
      }}
      secondaryButtonText={t("cancel")}
    />
  );
});

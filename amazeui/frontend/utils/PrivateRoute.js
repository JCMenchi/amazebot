import { useKeycloak } from '@react-keycloak/web';
import React from 'react';
import { Navigate } from 'react-router-dom';


export default function PrivateRoute({ children, roles }) {
    const {keycloak} = useKeycloak();

    const isAuthorized = (roles) => {
        if (keycloak && roles) {
            return roles.some(r => {
                const realm =  keycloak.hasRealmRole(r);
                const resource = keycloak.hasResourceRole(r);
                return realm || resource;
            });
        }
        return false;
    }

    return isAuthorized(roles)
                ? children
                : <Navigate to={{ pathname: '/login', }} />
}
